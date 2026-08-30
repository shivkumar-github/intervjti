from pathlib import Path
import os
import time

from dotenv import load_dotenv
from pymongo import MongoClient
from google import genai
from google.genai import types


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# .env is inside ai/ingestion/
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

if not GEMINI_API_KEY:
    raise RuntimeError(
        f"GEMINI_API_KEY not found in {ENV_FILE}"
    )

if not MONGO_URI:
    raise RuntimeError(
        f"MONGO_URI not found in {ENV_FILE}"
    )


# ============================================================
# MONGODB CONFIGURATION
# ============================================================

DATABASE_NAME = "test"
COLLECTION_NAME = "experiencechunks"


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

MODEL_NAME = "gemini-embedding-2"

OUTPUT_DIMENSIONALITY = 768

TASK_TYPE = "RETRIEVAL_DOCUMENT"


# ============================================================
# RETRY CONFIGURATION
# ============================================================

MAX_RETRIES = 3

INITIAL_RETRY_DELAY = 5


# ============================================================
# TEST CONFIGURATION
# ============================================================

# FIRST RUN:
# Keep this at 10.
#
# After confirming everything works, change to:
#
# TEST_LIMIT = None
#
# to process all remaining chunks.

TEST_LIMIT = 100


# ============================================================
# CREATE GEMINI CLIENT
# ============================================================

print()
print("=" * 60)
print("INTERVJTI GEMINI EMBEDDING GENERATION")
print("=" * 60)

print()
print("Environment file:")
print(ENV_FILE)

print(
    "Environment exists:",
    ENV_FILE.exists()
)

print(
    "GEMINI_API_KEY loaded:",
    bool(GEMINI_API_KEY)
)

if GEMINI_API_KEY:
    print(
        "GEMINI_API_KEY prefix:",
        GEMINI_API_KEY[:6]
    )

print()
print("Creating Gemini client...")

gemini_client = genai.Client(
    api_key=GEMINI_API_KEY
)

print("Gemini client created.")


# ============================================================
# CONNECT TO MONGODB
# ============================================================

print()
print("Connecting to MongoDB...")

mongo_client = MongoClient(
    MONGO_URI
)

mongo_client.admin.command("ping")

db = mongo_client[
    DATABASE_NAME
]

collection = db[
    COLLECTION_NAME
]

print(
    f"Connected to database: {DATABASE_NAME}"
)

print(
    f"Collection: {COLLECTION_NAME}"
)


# ============================================================
# GENERATE ONE EMBEDDING
# ============================================================

def generate_embedding(text):
    """
    Generate one 768-dimensional embedding for one chunk.
    """

    for attempt in range(
        1,
        MAX_RETRIES + 1
    ):

        try:

            response = gemini_client.models.embed_content(

                model=MODEL_NAME,

                contents=text,

                config=types.EmbedContentConfig(

                    output_dimensionality=OUTPUT_DIMENSIONALITY,

                    task_type=TASK_TYPE
                )
            )

            if not response.embeddings:

                raise RuntimeError(
                    "Gemini returned no embeddings."
                )

            embedding = response.embeddings[0].values

            if not embedding:

                raise RuntimeError(
                    "Gemini returned an empty embedding."
                )

            embedding = list(embedding)

            if len(embedding) != OUTPUT_DIMENSIONALITY:

                raise RuntimeError(
                    f"Expected {OUTPUT_DIMENSIONALITY} dimensions, "
                    f"got {len(embedding)}"
                )

            return embedding


        except Exception as error:

            error_text = str(error)

            print()
            print(
                f"    Attempt {attempt}/{MAX_RETRIES} failed:"
            )

            print(
                f"    {error_text}"
            )

            # ------------------------------------------------
            # QUOTA EXHAUSTION
            # ------------------------------------------------

            if (
                "429" in error_text
                or "RESOURCE_EXHAUSTED" in error_text
            ):

                print()
                print(
                    "    Gemini quota/rate limit reached."
                )

                print(
                    "    Stopping instead of repeatedly retrying."
                )

                raise


            # ------------------------------------------------
            # LAST ATTEMPT
            # ------------------------------------------------

            if attempt == MAX_RETRIES:

                raise


            delay = INITIAL_RETRY_DELAY * (
                2 ** (attempt - 1)
            )

            print(
                f"    Retrying in {delay} seconds..."
            )

            time.sleep(delay)


# ============================================================
# COUNT CHUNKS
# ============================================================

total_chunks = collection.count_documents({})

embedded_chunks = collection.count_documents(
    {
        "embedding": {
            "$exists": True,
            "$ne": None
        }
    }
)

remaining_chunks = collection.count_documents(
    {
        "$or": [
            {
                "embedding": {
                    "$exists": False
                }
            },
            {
                "embedding": None
            }
        ]
    }
)


print()
print(
    f"Total chunks     : {total_chunks}"
)

print(
    f"Already embedded : {embedded_chunks}"
)

print(
    f"Remaining        : {remaining_chunks}"
)

print()
print("Embedding configuration:")

print(
    f"  Model      : {MODEL_NAME}"
)

print(
    f"  Dimensions : {OUTPUT_DIMENSIONALITY}"
)

print(
    f"  Task       : {TASK_TYPE}"
)

print(
    f"  Test limit : {TEST_LIMIT}"
)


# ============================================================
# SAFETY CHECKS
# ============================================================

if total_chunks == 0:

    print()
    print("No chunks found in MongoDB.")
    print("Run chunk.py first.")

    mongo_client.close()

    raise SystemExit


if remaining_chunks == 0:

    print()
    print("All chunks already have embeddings.")
    print("Nothing to do.")

    mongo_client.close()

    raise SystemExit


# ============================================================
# DETERMINE PROCESSING LIMIT
# ============================================================

if TEST_LIMIT is None:

    process_limit = remaining_chunks

else:

    process_limit = min(
        TEST_LIMIT,
        remaining_chunks
    )


print()
print(
    f"Chunks to process this run: {process_limit}"
)

print()


# ============================================================
# FETCH UNEMBEDDED CHUNKS
# ============================================================

cursor = collection.find(

    {
        "$or": [
            {
                "embedding": {
                    "$exists": False
                }
            },
            {
                "embedding": None
            }
        ]
    },

    {
        "_id": 1,
        "text": 1,
        "companyName": 1,
        "studentName": 1,
        "chunkIndex": 1
    }

).limit(process_limit)


chunks = list(cursor)


if not chunks:

    print(
        "No unembedded chunks found."
    )

    mongo_client.close()

    raise SystemExit


# ============================================================
# PROCESS CHUNKS
# ============================================================

successful = 0
failed = 0


print("=" * 60)
print("STARTING EMBEDDING GENERATION")
print("=" * 60)

print()


for index, chunk in enumerate(
    chunks,
    start=1
):

    chunk_id = chunk["_id"]

    text = chunk.get(
        "text",
        ""
    )

    company = chunk.get(
        "companyName",
        "Unknown"
    )

    student = chunk.get(
        "studentName",
        "Unknown"
    )

    chunk_index = chunk.get(
        "chunkIndex",
        0
    )


    print(
        f"[{index}/{len(chunks)}] "
        f"{company} | "
        f"{student} | "
        f"chunk {chunk_index}"
    )


    # --------------------------------------------------------
    # EMPTY TEXT CHECK
    # --------------------------------------------------------

    if not text or not text.strip():

        print(
            "    SKIPPED: empty text"
        )

        failed += 1

        continue


    # --------------------------------------------------------
    # GENERATE EMBEDDING
    # --------------------------------------------------------

    try:

        embedding = generate_embedding(
            text
        )


    except KeyboardInterrupt:

        print()
        print(
            "Embedding process interrupted by user."
        )

        print(
            "Already stored embeddings are safe."
        )

        break


    except Exception as error:

        failed += 1

        print(
            f"    FAILED: {error}"
        )

        # Continue with the next chunk for normal errors.
        # If quota is exhausted, generate_embedding()
        # already raises immediately.
        continue


    # --------------------------------------------------------
    # STORE EMBEDDING
    # --------------------------------------------------------

    try:

        result = collection.update_one(

            {
                "_id": chunk_id,

                # Safety check:
                # never overwrite an existing embedding.
                "$or": [
                    {
                        "embedding": {
                            "$exists": False
                        }
                    },
                    {
                        "embedding": None
                    }
                ]
            },

            {
                "$set": {
                    "embedding": embedding
                }
            }
        )


        if result.modified_count == 1:

            successful += 1

            print(
                f"    SUCCESS "
                f"({len(embedding)} dimensions)"
            )

        else:

            print(
                "    SKIPPED: embedding already exists"
            )


    except Exception as error:

        failed += 1

        print(
            f"    MongoDB update failed: {error}"
        )


# ============================================================
# FINAL VERIFICATION
# ============================================================

final_embedded = collection.count_documents(
    {
        "embedding": {
            "$exists": True,
            "$ne": None
        }
    }
)

final_remaining = collection.count_documents(
    {
        "$or": [
            {
                "embedding": {
                    "$exists": False
                }
            },
            {
                "embedding": None
            }
        ]
    }
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print()
print("=" * 60)
print("EMBEDDING RUN COMPLETE")
print("=" * 60)

print(
    f"Total chunks in DB   : {total_chunks}"
)

print(
    f"Previously embedded  : {embedded_chunks}"
)

print(
    f"Processed this run   : {successful + failed}"
)

print(
    f"Successful this run  : {successful}"
)

print(
    f"Failed this run      : {failed}"
)

print(
    f"Total with vectors   : {final_embedded}"
)

print(
    f"Remaining            : {final_remaining}"
)

print(
    f"Vector dimensions    : {OUTPUT_DIMENSIONALITY}"
)

print(
    f"Embedding model      : {MODEL_NAME}"
)

print("=" * 60)


# ============================================================
# CLOSE MONGODB
# ============================================================

mongo_client.close()

print()
print("MongoDB connection closed.")
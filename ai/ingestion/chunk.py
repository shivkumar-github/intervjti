from pathlib import Path
import os
import re

from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Your backend uses server/.env
ENV_FILE = BASE_DIR.parent.parent / "server" / ".env"

load_dotenv(ENV_FILE)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI not found in server/.env"
    )


DATABASE_NAME = "test"

SOURCE_COLLECTION = "experiences"

TARGET_COLLECTION = "experiencechunks"


# ============================================================
# CHUNK CONFIGURATION
# ============================================================

# Approximate character size.
#
# 1 token is roughly 4 characters for normal English text.
#
# 3000 characters ≈ 750 tokens.
#
# We keep chunks reasonably small so retrieval can return
# focused portions of an interview experience.

CHUNK_SIZE = 3000

# Overlap prevents important information from being cut
# exactly at a chunk boundary.

CHUNK_OVERLAP = 300


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):
    """
    Clean extracted interview text while preserving
    paragraph structure.
    """

    if not text:
        return ""

    # Normalize Windows line endings.
    text = text.replace("\r\n", "\n")

    # Replace tabs with spaces.
    text = text.replace("\t", " ")

    # Remove excessive spaces.
    text = re.sub(
        r"[ ]{2,}",
        " ",
        text
    )

    # Collapse excessive blank lines.
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    return text.strip()


# ============================================================
# CHUNKING
# ============================================================

def split_text(text):
    """
    Split text into chunks while trying to respect
    paragraph and sentence boundaries.
    """

    text = clean_text(text)

    if not text:
        return []

    chunks = []

    start = 0

    text_length = len(text)

    while start < text_length:

        end = min(
            start + CHUNK_SIZE,
            text_length
        )

        # If this isn't the last chunk,
        # try to move the boundary to a natural
        # paragraph/sentence boundary.

        if end < text_length:

            # Look for a paragraph break.
            paragraph_boundary = text.rfind(
                "\n\n",
                start,
                end
            )

            # If no paragraph boundary,
            # look for a sentence boundary.
            sentence_boundary = text.rfind(
                ". ",
                start,
                end
            )

            # Prefer paragraph boundary.
            if paragraph_boundary > start + CHUNK_SIZE // 2:

                end = paragraph_boundary + 2

            elif sentence_boundary > start + CHUNK_SIZE // 2:

                end = sentence_boundary + 2

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        # Last chunk.
        if end >= text_length:
            break

        # Move backwards by overlap.
        start = end - CHUNK_OVERLAP

        if start < 0:
            start = 0

    return chunks


# ============================================================
# CONNECT TO MONGODB
# ============================================================

print()
print("=" * 60)
print("INTERVJTI EXPERIENCE CHUNKING")
print("=" * 60)

print("Connecting to MongoDB...")

client = MongoClient(MONGO_URI)

# Test connection.
client.admin.command("ping")

db = client[DATABASE_NAME]

experiences = db[SOURCE_COLLECTION]

chunks_collection = db[TARGET_COLLECTION]

print(
    f"Connected to database: {DATABASE_NAME}"
)

print(
    f"Experiences found: "
    f"{experiences.count_documents({})}"
)


# ============================================================
# CLEAR EXISTING CHUNKS
# ============================================================

# We want this script to be safely re-runnable.
#
# For development, we'll remove previously generated
# chunks and rebuild them.

print()
print("Removing previous generated chunks...")

delete_result = chunks_collection.delete_many({})

print(
    f"Deleted {delete_result.deleted_count} "
    f"old chunks."
)


# ============================================================
# PROCESS EXPERIENCES
# ============================================================

total_experiences = experiences.count_documents({})

total_chunks = 0

failed = 0


cursor = experiences.find({})


for index, experience in enumerate(
    cursor,
    start=1
):

    experience_id = experience["_id"]

    student_name = experience.get(
        "studentName",
        "Unknown"
    )

    company_name = experience.get(
        "companyName",
        "Unknown"
    )

    content = experience.get(
        "content",
        ""
    )

    source = experience.get(
        "source",
        {}
    )

    print()
    print(
        f"[{index}/{total_experiences}] "
        f"{student_name} - {company_name}"
    )


    try:

        chunks = split_text(content)

        if not chunks:

            print(
                "  SKIPPED: no usable content"
            )

            continue


        documents = []


        for chunk_index, chunk_text in enumerate(
            chunks
        ):

            document = {

                "experienceId": experience_id,

                "chunkIndex": chunk_index,

                "text": chunk_text,

                "companyName": company_name,

                "year": source.get(
                    "year"
                ),

                "experienceType": source.get(
                    "experienceType"
                ),

                "studentName": student_name,

                "source": {

                    "fileId": source.get(
                        "fileId"
                    ),

                    "fileName": source.get(
                        "fileName"
                    ),

                    "originalPath": source.get(
                        "originalPath"
                    )

                }

            }

            documents.append(
                document
            )


        if documents:

            result = chunks_collection.insert_many(
                documents
            )

            count = len(
                result.inserted_ids
            )

            total_chunks += count

            print(
                f"  Created {count} chunks"
            )


    except Exception as error:

        failed += 1

        print(
            f"  FAILED: {error}"
        )


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 60)
print("CHUNKING COMPLETE")
print("=" * 60)

print(
    f"Experiences processed : "
    f"{total_experiences}"
)

print(
    f"Chunks created        : "
    f"{total_chunks}"
)

print(
    f"Failed experiences    : "
    f"{failed}"
)

print("=" * 60)


client.close()

print(
    "MongoDB connection closed."
)
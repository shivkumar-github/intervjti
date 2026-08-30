from pathlib import Path
import json
import os

from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

STRUCTURED_DIR = BASE_DIR / "structured"


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

# Your backend uses MONGO_URI.
#
# We will first look in the backend .env,
# then fall back to ai/ingestion/.env.

BACKEND_ENV = BASE_DIR.parent.parent / "server" / ".env"

LOCAL_ENV = BASE_DIR / ".env"


if BACKEND_ENV.exists():

    load_dotenv(
        BACKEND_ENV
    )

else:

    load_dotenv(
        LOCAL_ENV
    )


MONGO_URI = os.getenv(
    "MONGO_URI"
)


if not MONGO_URI:

    raise RuntimeError(
        "MONGO_URI was not found.\n\n"
        "Your backend uses process.env.MONGO_URI.\n"
        "Make sure server/.env contains MONGO_URI."
    )


# ============================================================
# IMPORT CONFIGURATION
# ============================================================

SYSTEM_EMAIL = "imported@intervjti.system"

SYSTEM_NAME = "Imported Experiences"

SYSTEM_ROLE = "admin"


# ============================================================
# CONNECT TO MONGODB
# ============================================================

print()
print("=" * 60)
print("INTERVJTI MONGODB IMPORT")
print("=" * 60)

print(
    "Connecting to MongoDB..."
)


client = MongoClient(
    MONGO_URI
)


# Force a connection test.

client.admin.command(
    "ping"
)


# Use the database specified in the URI.

database = client["test"]


if database is None:

    raise RuntimeError(
        "Could not determine MongoDB database "
        "from MONGO_URI."
    )


print(
    f"Connected to database: {database.name}"
)


# ============================================================
# COLLECTIONS
# ============================================================

users_collection = database["users"]

experiences_collection = database["experiences"]


# ============================================================
# FIND OR CREATE SYSTEM USER
# ============================================================

print()
print(
    "Finding import user..."
)


system_user = users_collection.find_one(
    {
        "email": SYSTEM_EMAIL
    }
)


if system_user:

    system_user_id = system_user["_id"]

    print(
        f"Found existing import user:"
        f" {system_user_id}"
    )

else:

    print(
        "Import user does not exist."
    )

    print(
        "Creating import user..."
    )


    system_user = {

        "email": SYSTEM_EMAIL,

        "name": SYSTEM_NAME,

        "role": SYSTEM_ROLE

    }


    result = users_collection.insert_one(
        system_user
    )


    system_user_id = result.inserted_id


    print(
        f"Created import user:"
        f" {system_user_id}"
    )


# ============================================================
# LOAD STRUCTURED FILES
# ============================================================

json_files = sorted(
    STRUCTURED_DIR.glob("*.json")
)


print()
print(
    f"Structured JSON files found: "
    f"{len(json_files)}"
)


if not json_files:

    print(
        "No structured JSON files found."
    )

    client.close()

    raise SystemExit(0)


# ============================================================
# COUNTERS
# ============================================================

imported = 0

skipped = 0

failed = 0


# ============================================================
# PROCESS FILE
# ============================================================

for index, json_file in enumerate(
    json_files,
    start=1
):

    print()
    print(
        f"[{index}/{len(json_files)}] "
        f"{json_file.name}"
    )


    try:

        # ----------------------------------------------------
        # Load JSON
        # ----------------------------------------------------

        with open(
            json_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(
                file
            )


        # ----------------------------------------------------
        # Basic validation
        # ----------------------------------------------------

        required_fields = [

            "studentName",

            "companyName",

            "batch",

            "preview",

            "content"

        ]


        missing_fields = [

            field

            for field in required_fields

            if field not in data

        ]


        if missing_fields:

            raise ValueError(

                "Missing fields: "
                + ", ".join(
                    missing_fields
                )

            )


        # ----------------------------------------------------
        # Get source metadata
        # ----------------------------------------------------

        source = data.get(
            "source",
            {}
        )


        file_id = source.get(
            "fileId"
        )


        if not file_id:

            # Fall back to JSON filename.

            file_id = json_file.stem


        # ----------------------------------------------------
        # DUPLICATE CHECK
        # ----------------------------------------------------

        existing = experiences_collection.find_one(

            {
                "source.fileId": file_id
            }

        )


        if existing:

            print(
                "SKIPPED: already exists in MongoDB"
            )

            skipped += 1

            continue


        # ----------------------------------------------------
        # Build Experience document
        # ----------------------------------------------------

        experience = {

            "userId": system_user_id,

            "studentName": data.get(
                "studentName",
                "Not specified"
            ),

            "companyName": data.get(
                "companyName",
                "Not specified"
            ),

            "batch": data.get(
                "batch",
                "Not specified"
            ),

            "preview": data.get(
                "preview",
                ""
            ),

            "content": data.get(
                "content",
                ""
            ),

            # Imported historical experiences
            # should be immediately available.

            "status": "approved",

            "source": {

                "fileId": file_id,

                "fileName": source.get(
                    "fileName"
                ),

                "originalPath": source.get(
                    "originalPath"
                ),

                "year": source.get(
                    "year"
                ),

                "experienceType": source.get(
                    "experienceType"
                ),

                "companyFolder": source.get(
                    "companyFolder"
                )

            },

            # Keep compatibility with your
            # existing schema field.

            "importSourcePath": source.get(
                "originalPath"
            )

        }


        # ----------------------------------------------------
        # Insert
        # ----------------------------------------------------

        result = experiences_collection.insert_one(
            experience
        )


        print(
            f"IMPORTED: {result.inserted_id}"
        )


        imported += 1


    except Exception as error:

        failed += 1


        print(
            f"FAILED: {json_file.name}"
        )

        print(
            f"Error: {error}"
        )


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 60)
print("IMPORT COMPLETE")
print("=" * 60)

print(
    f"JSON files : {len(json_files)}"
)

print(
    f"Imported   : {imported}"
)

print(
    f"Skipped    : {skipped}"
)

print(
    f"Failed     : {failed}"
)

print("=" * 60)


# ============================================================
# CLOSE CONNECTION
# ============================================================

client.close()

print(
    "MongoDB connection closed."
)
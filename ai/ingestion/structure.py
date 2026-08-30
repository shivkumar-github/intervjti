from pathlib import Path
import json
import os
import time
from datetime import datetime

from dotenv import load_dotenv
from google import genai


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Extracted PDF JSON files
INPUT_DIR = BASE_DIR / "output"

# Successfully structured files
STRUCTURED_DIR = BASE_DIR / "structured"

# Failed processing information
FAILED_DIR = BASE_DIR / "failed"

STRUCTURED_DIR.mkdir(parents=True, exist_ok=True)
FAILED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

load_dotenv(BASE_DIR / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY was not found.\n"
        "Make sure ai/ingestion/.env exists and contains:\n"
        "GEMINI_API_KEY=your_key_here"
    )

client = genai.Client(api_key=api_key)

MODEL = "gemini-3.5-flash-lite"


# ============================================================
# GEMINI OUTPUT SCHEMA
# ============================================================

EXPERIENCE_SCHEMA = {
    "type": "object",

    "properties": {

        "studentName": {
            "type": "string"
        },

        "companyName": {
            "type": "string"
        },

        "batch": {
            "type": "string"
        },

        "preview": {
            "type": "string"
        },

        "content": {
            "type": "string"
        }
    },

    "required": [
        "studentName",
        "companyName",
        "batch",
        "preview",
        "content"
    ]
}


# ============================================================
# LOAD JSON
# ============================================================

def load_json(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


# ============================================================
# BUILD DOCUMENT TEXT
# ============================================================

def build_document_text(data):

    pages = data.get("pages", [])

    sections = []

    for page in pages:

        text = page.get(
            "text",
            ""
        ).strip()

        if not text:
            continue

        page_number = page.get(
            "pageNumber",
            "?"
        )

        sections.append(
            f"--- PAGE {page_number} ---\n"
            f"{text}"
        )

    return "\n\n".join(sections)


# ============================================================
# EXTRACT STRUCTURED EXPERIENCE USING GEMINI
# ============================================================

def extract_experience(data):

    document_text = build_document_text(data)

    source = data.get(
        "source",
        {}
    )

    source_year = source.get(
        "year",
        "Not specified"
    )

    source_type = source.get(
        "experienceType",
        "Not specified"
    )

    source_company = source.get(
        "companyFolder",
        "Not specified"
    )


    prompt = f"""
You are an information extraction system for Intervjti,
an interview-experience platform.

Your task is to convert the supplied interview-experience
document into the required JSON structure.

IMPORTANT RULES:

1. ONLY use information explicitly present in the document
   or the supplied source metadata.

2. NEVER invent information.

3. NEVER use outside knowledge.

4. If the student's name cannot be determined,
   return:

   "Not specified"

5. If the batch cannot be determined,
   return:

   "Not specified"

6. Do NOT infer a batch from the year.

7. The company folder supplied in the metadata is:

   {source_company}

   Use it as the company name when it clearly represents
   the company associated with the experience.

8. Do NOT invent or guess a company name.

9. The "content" field must preserve the COMPLETE
   interview experience.

10. DO NOT summarize the content field.

11. Preserve meaningful details such as:

    - Online assessments
    - Coding questions
    - Interview rounds
    - Technical questions
    - DSA questions
    - OOP questions
    - DBMS
    - Operating Systems
    - Computer Networks
    - System Design
    - Projects
    - Technologies
    - Cloud
    - HR questions
    - Behavioral questions
    - Interviewer's comments
    - Candidate's comments
    - Final result
    - Preparation advice
    - Resources
    - Important tips

12. You may clean obvious PDF extraction problems such as:

    - Excessive whitespace
    - Broken line formatting
    - Repeated line breaks

13. Do NOT remove meaningful information.

14. The "preview" field should be a concise 1-2 sentence
    description of the experience.

15. If information is unavailable, use:

    "Not specified"

SOURCE METADATA

Year:
{source_year}

Experience Type:
{source_type}

Company Folder:
{source_company}


SOURCE DOCUMENT

{document_text}
"""


    response = client.models.generate_content(

        model=MODEL,

        contents=prompt,

        config={
            "response_mime_type": "application/json",
            "response_schema": EXPERIENCE_SCHEMA
        }
    )


    return json.loads(
        response.text
    )


# ============================================================
# VALIDATE OUTPUT
# ============================================================

def validate_experience(data):

    required_fields = [
        "studentName",
        "companyName",
        "batch",
        "preview",
        "content"
    ]

    for field in required_fields:

        if field not in data:

            return (
                False,
                f"Missing field: {field}"
            )


        if not isinstance(
            data[field],
            str
        ):

            return (
                False,
                f"Invalid type: {field}"
            )


        if not data[field].strip():

            return (
                False,
                f"Empty field: {field}"
            )


    return True, None


# ============================================================
# SAVE FAILURE INFORMATION
# ============================================================

def save_failure(
    json_file,
    error
):

    failure_file = (
        FAILED_DIR /
        f"{json_file.stem}.json"
    )


    result = {

        "fileId": json_file.stem,

        "inputFile": json_file.name,

        "error": str(error),

        "timestamp": datetime.now().isoformat()
    }


    with open(
        failure_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2
        )


# ============================================================
# PROCESS ONE FILE
# ============================================================

def process_file(json_file):

    output_file = (
        STRUCTURED_DIR /
        json_file.name
    )


    # --------------------------------------------------------
    # Already processed
    # --------------------------------------------------------

    if output_file.exists():

        print(
            f"SKIPPED: {json_file.name} "
            f"(already structured)"
        )

        return "skipped"


    # --------------------------------------------------------
    # Load extracted JSON
    # --------------------------------------------------------

    data = load_json(
        json_file
    )


    # --------------------------------------------------------
    # Only process successful extraction
    # --------------------------------------------------------

    if data.get("status") != "success":

        print(
            f"SKIPPED: {json_file.name} "
            f"(status={data.get('status')})"
        )

        return "skipped"


    # --------------------------------------------------------
    # Check if document actually contains text
    # --------------------------------------------------------

    document_text = build_document_text(
        data
    )

    if len(document_text.strip()) < 50:

        print(
            f"SKIPPED: {json_file.name} "
            f"(very little extracted text)"
        )

        return "skipped"


    # --------------------------------------------------------
    # Gemini
    # --------------------------------------------------------

    print(
        f"Sending to Gemini..."
    )


    structured_data = extract_experience(
        data
    )


    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    valid, error = validate_experience(
        structured_data
    )

    if not valid:

        raise RuntimeError(
            error
        )


    # --------------------------------------------------------
    # Preserve source metadata
    # --------------------------------------------------------

    structured_data["source"] = {

        "fileId": data.get(
            "fileId"
        ),

        "fileName": data.get(
            "fileName"
        ),

        **data.get(
            "source",
            {}
        )
    }


    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            structured_data,
            file,
            ensure_ascii=False,
            indent=2
        )


    print(
        f"SUCCESS: {json_file.name}"
    )

    return "success"


# ============================================================
# MAIN
# ============================================================

def main():

    # --------------------------------------------------------
    # Find ALL extracted JSON files
    # --------------------------------------------------------

    json_files = sorted(
        INPUT_DIR.glob("*.json")
    )


    print()
    print("=" * 60)
    print("INTERVJTI STRUCTURED INGESTION")
    print("=" * 60)

    print(
        f"Model       : {MODEL}"
    )

    print(
        f"Input files : {len(json_files)}"
    )

    print("=" * 60)
    print()


    if not json_files:

        print(
            "No extracted JSON files found."
        )

        return


    # --------------------------------------------------------
    # Counters
    # --------------------------------------------------------

    successful = 0
    skipped = 0
    failed = 0


    # --------------------------------------------------------
    # Process
    # --------------------------------------------------------

    for index, json_file in enumerate(
        json_files,
        start=1
    ):

        print(
            f"[{index}/{len(json_files)}] "
            f"{json_file.name}"
        )


        try:

            result = process_file(
                json_file
            )


            if result == "success":

                successful += 1

            elif result == "skipped":

                skipped += 1


        except Exception as error:

            failed += 1


            print(
                f"FAILED: {json_file.name}"
            )

            print(
                f"Error: {error}"
            )


            save_failure(
                json_file,
                error
            )


        print()


        # ----------------------------------------------------
        # Small delay to be friendly to free-tier limits
        # ----------------------------------------------------

        if index < len(json_files):

            time.sleep(1)


    # --------------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("PROCESSING COMPLETE")
    print("=" * 60)

    print(
        f"Total input files : {len(json_files)}"
    )

    print(
        f"Successful        : {successful}"
    )

    print(
        f"Skipped           : {skipped}"
    )

    print(
        f"Failed            : {failed}"
    )

    print("=" * 60)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()
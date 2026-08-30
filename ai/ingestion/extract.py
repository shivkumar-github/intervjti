from pathlib import Path
import json
import hashlib
import pymupdf


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Root directory containing the original PDF collection
PDF_ROOT = Path(
    r"C:\Users\shivk\Downloads\Internship Guide - CoC"
)

OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# GENERATE STABLE FILE ID
# ============================================================

def generate_file_id(file_path: Path) -> str:
    """
    Generate a stable ID based on the PDF contents.

    Same PDF content = same ID.
    """

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:

        while chunk := file.read(1024 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()[:16]


# ============================================================
# EXTRACT METADATA FROM PATH
# ============================================================

def extract_path_metadata(file_path: Path):
    """
    Extract useful metadata from the folder structure.

    Example:

    2025 Experiences/
        Internships/
            BNY/
                rushi bny 2025.pdf

    becomes:

    year = 2025
    experienceType = Internships
    companyFolder = BNY
    """

    relative_path = file_path.relative_to(PDF_ROOT)

    parts = relative_path.parts

    metadata = {
        "originalPath": str(relative_path),
        "year": None,
        "experienceType": None,
        "companyFolder": None
    }

    # --------------------------------------------------------
    # Find the "Experiences" folder
    # --------------------------------------------------------

    experience_folder_index = None

    for index, part in enumerate(parts):

        if part.endswith("Experiences"):
            experience_folder_index = index
            break

    if experience_folder_index is not None:

        experience_folder = parts[experience_folder_index]

        # Example:
        # "2025 Experiences" -> "2025"

        if experience_folder[:4].isdigit():
            metadata["year"] = experience_folder[:4]

        elif experience_folder.lower().startswith("pre"):
            metadata["year"] = "pre-2018"


        # ----------------------------------------------------
        # Folder immediately after Experiences
        # ----------------------------------------------------

        type_index = experience_folder_index + 1

        if type_index < len(parts) - 1:
            metadata["experienceType"] = parts[type_index]


        # ----------------------------------------------------
        # Folder immediately before PDF
        # ----------------------------------------------------

        if len(parts) >= 2:

            company_folder = parts[-2]

            metadata["companyFolder"] = company_folder

    return metadata


# ============================================================
# EXTRACT ONE PDF
# ============================================================

def extract_pdf(file_path: Path):

    print(f"Processing: {file_path}")

    file_id = generate_file_id(file_path)

    output_file = OUTPUT_DIR / f"{file_id}.json"


    # --------------------------------------------------------
    # Skip if already successfully processed
    # --------------------------------------------------------

    if output_file.exists():

        try:

            with open(output_file, "r", encoding="utf-8") as file:
                existing_data = json.load(file)

            if existing_data.get("status") == "success":

                print(
                    f"SKIPPED: {file_path.name} "
                    f"(already processed)"
                )

                return existing_data

        except Exception:
            pass


    try:

        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        path_metadata = extract_path_metadata(file_path)


        # ----------------------------------------------------
        # Open PDF
        # ----------------------------------------------------

        document = pymupdf.open(file_path)

        pages = []


        # ----------------------------------------------------
        # Extract every page
        # ----------------------------------------------------

        for page_number, page in enumerate(
            document,
            start=1
        ):

            text = page.get_text("text").strip()

            pages.append({
                "pageNumber": page_number,
                "text": text
            })


        document.close()


        # ----------------------------------------------------
        # Check extracted text
        # ----------------------------------------------------

        total_text_length = sum(
            len(page["text"])
            for page in pages
        )


        if total_text_length < 100:

            status = "ocr_required"

            print(
                f"WARNING: {file_path.name} "
                f"contains very little extractable text."
            )

        else:

            status = "success"

            print(
                f"SUCCESS: {file_path.name} "
                f"({len(pages)} pages)"
            )


        # ----------------------------------------------------
        # Final result
        # ----------------------------------------------------

        result = {

            "fileId": file_id,

            "fileName": file_path.name,

            "status": status,

            "source": path_metadata,

            "pages": pages
        }


        # ----------------------------------------------------
        # Save
        # ----------------------------------------------------

        with open(
            output_file,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                result,
                file,
                ensure_ascii=False,
                indent=2
            )


        return result


    except Exception as error:

        print(
            f"FAILED: {file_path.name}"
        )

        print(
            f"Error: {error}"
        )


        result = {

            "fileId": file_id,

            "fileName": file_path.name,

            "status": "failed",

            "source": extract_path_metadata(file_path),

            "error": str(error),

            "pages": []
        }


        with open(
            output_file,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                result,
                file,
                ensure_ascii=False,
                indent=2
            )


        return result


# ============================================================
# FIND RELEVANT PDFs
# ============================================================

def find_experience_pdfs():

    pdf_files = []

    for pdf_file in PDF_ROOT.rglob("*.pdf"):

        relative_path = pdf_file.relative_to(PDF_ROOT)

        # Check whether this PDF is somewhere inside
        # a folder whose name ends with "Experiences".

        if any(
            part.endswith("Experiences")
            for part in relative_path.parts
        ):

            pdf_files.append(pdf_file)


    return sorted(pdf_files)


# ============================================================
# MAIN
# ============================================================

def main():

    if not PDF_ROOT.exists():

        raise RuntimeError(
            f"PDF root directory does not exist:\n"
            f"{PDF_ROOT}"
        )


    pdf_files = find_experience_pdfs()


    print("=" * 60)
    print("INTERVJTI PDF INGESTION")
    print("=" * 60)

    print(
        f"PDF root: {PDF_ROOT}"
    )

    print(
        f"Found {len(pdf_files)} experience PDF(s)."
    )

    print("=" * 60)
    print()


    successful = 0
    ocr_required = 0
    failed = 0
    skipped = 0


    # --------------------------------------------------------
    # Process files
    # --------------------------------------------------------

    for index, pdf_file in enumerate(
        pdf_files,
        start=1
    ):

        print(
            f"[{index}/{len(pdf_files)}]"
        )

        result = extract_pdf(pdf_file)


        if result is None:
            failed += 1

        elif result["status"] == "success":

            # Determine whether this was newly processed
            output_file = OUTPUT_DIR / (
                f"{result['fileId']}.json"
            )

            # We count it as processed here.
            successful += 1

        elif result["status"] == "ocr_required":

            ocr_required += 1

        elif result["status"] == "failed":

            failed += 1


        print()


    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print("=" * 60)
    print("INGESTION COMPLETE")
    print("=" * 60)

    print(
        f"Total PDFs       : {len(pdf_files)}"
    )

    print(
        f"Successful       : {successful}"
    )

    print(
        f"OCR required     : {ocr_required}"
    )

    print(
        f"Failed           : {failed}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()
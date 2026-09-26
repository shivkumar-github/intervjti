require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const striptags = require("striptags");

const ExperienceChunk = require("../models/experienceChunk");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;

const CHUNK_SIZE = 3000;
const CHUNK_OVERLAP = 300;


// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(text) {

    if (!text) {
        return "";
    }

    // Experience content comes from the rich-text editor
    // and may contain HTML.
    text = striptags(text);

    // Normalize line endings.
    text = text.replace(/\r\n/g, "\n");

    // Replace tabs with spaces.
    text = text.replace(/\t/g, " ");

    // Remove excessive spaces.
    text = text.replace(/[ ]{2,}/g, " ");

    // Remove excessive blank lines.
    text = text.replace(/\n{3,}/g, "\n\n");

    return text.trim();
}


// ============================================================
// SPLIT TEXT INTO CHUNKS
// ============================================================

function splitText(text) {

    text = cleanText(text);

    if (!text) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        let end = Math.min(
            start + CHUNK_SIZE,
            text.length
        );

        // Try to end at a natural boundary.
        if (end < text.length) {

            const paragraphBoundary =
                text.lastIndexOf("\n\n", end);

            const sentenceBoundary =
                text.lastIndexOf(". ", end);

            if (
                paragraphBoundary >
                start + CHUNK_SIZE / 2
            ) {

                end = paragraphBoundary + 2;

            } else if (
                sentenceBoundary >
                start + CHUNK_SIZE / 2
            ) {

                end = sentenceBoundary + 2;
            }
        }

        const chunk = text
            .slice(start, end)
            .trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= text.length) {
            break;
        }

        // Maintain overlap between chunks.
        start = end - CHUNK_OVERLAP;

        if (start < 0) {
            start = 0;
        }
    }

    return chunks;
}


// ============================================================
// GENERATE DOCUMENT EMBEDDING
// ============================================================

async function generateEmbedding(text) {

    const response = await ai.models.embedContent({

        model: EMBEDDING_MODEL,

        contents: text,

        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS,
            taskType: "RETRIEVAL_DOCUMENT"
        }
    });

    if (
        !response.embeddings ||
        !response.embeddings[0]
    ) {
        throw new Error(
            "Gemini returned no embedding."
        );
    }

    return response.embeddings[0].values;
}


// ============================================================
// PROCESS APPROVED EXPERIENCE FOR RAG
// ============================================================

async function processExperienceForRAG(experience) {

    // --------------------------------------------------------
    // Safety check
    // --------------------------------------------------------

    if (experience.status !== "approved") {

        throw new Error(
            "Only approved experiences can be processed for RAG."
        );
    }


    console.log(
        `Starting RAG processing for experience ${experience._id}`
    );


    // --------------------------------------------------------
    // 1. Clean editor content
    // --------------------------------------------------------

    const text = cleanText(
        experience.content
    );

    if (!text) {

        throw new Error(
            "Experience has no usable content."
        );
    }


    // --------------------------------------------------------
    // 2. Create chunks
    // --------------------------------------------------------

    const chunks = splitText(text);

    if (chunks.length === 0) {

        throw new Error(
            "No chunks were generated."
        );
    }


    console.log(
        `Generated ${chunks.length} chunks.`
    );


    // --------------------------------------------------------
    // 3. Delete existing chunks
    // --------------------------------------------------------
    //
    // This makes re-processing safe.
    //
    // Example:
    //
    // experience updated
    //       ↓
    // approve again
    //       ↓
    // old chunks removed
    //       ↓
    // new chunks created
    //

    await ExperienceChunk.deleteMany({
        experienceId: experience._id
    });


    // --------------------------------------------------------
    // 4. Generate embeddings
    // --------------------------------------------------------

    const documents = [];

    for (
        let chunkIndex = 0;
        chunkIndex < chunks.length;
        chunkIndex++
    ) {

        const chunkText =
            chunks[chunkIndex];


        console.log(
            `Generating embedding ${chunkIndex + 1}/${chunks.length}`
        );


        const embedding =
            await generateEmbedding(
                chunkText
            );


        // ----------------------------------------------------
        // 5. Build ExperienceChunk document
        // ----------------------------------------------------

        documents.push({

            experienceId:
                experience._id,

            chunkIndex,

            text:
                chunkText,

            companyName:
                experience.companyName,

            year:
                experience.batch,

            experienceType:
                experience.experienceType ||
                experience.source?.experienceType ||
                "Interview",

            studentName:
                experience.studentName,

            source: {

                fileId:
                    experience.source?.fileId,

                fileName:
                    experience.source?.fileName,

                originalPath:
                    experience.source?.originalPath
            },

            embedding
        });
    }


    // --------------------------------------------------------
    // 6. Store chunks in MongoDB
    // --------------------------------------------------------

    await ExperienceChunk.insertMany(
        documents
    );


    console.log(
        `RAG processing completed for ${experience._id}`
    );

    console.log(
        `Stored ${documents.length} ExperienceChunk documents.`
    );


    return {

        experienceId:
            experience._id,

        chunksCreated:
            documents.length
    };
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    processExperienceForRAG
};
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

// ============================================================
// GEMINI CLIENT
// ============================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ============================================================
// CONFIGURATION
// ============================================================

const VECTOR_INDEX = "experience_chunk_vector_index";
const COLLECTION_NAME = "experiencechunks";

const EMBEDDING_MODEL = "gemini-embedding-2";
const GENERATION_MODEL = "gemini-3.6-flash";

const EMBEDDING_DIMENSIONS = 768;

// Keep this at 5 for now.
// We will improve retrieval architecture later.
const RETRIEVAL_LIMIT = 5;
const NUM_CANDIDATES = 100;


// ============================================================
// ASK RAG
// ============================================================

async function askRAG(question) {

    if (!question || !question.trim()) {
        throw new Error("Question is required.");
    }

    const collection =
        mongoose.connection.db.collection(COLLECTION_NAME);


    // ========================================================
    // 1. EMBED USER QUERY
    // ========================================================

    const embeddingResponse =
        await ai.models.embedContent({

            model: EMBEDDING_MODEL,

            contents: question,

            config: {
                outputDimensionality: EMBEDDING_DIMENSIONS,
                taskType: "RETRIEVAL_QUERY"
            }
        });


    if (
        !embeddingResponse.embeddings ||
        !embeddingResponse.embeddings[0]
    ) {
        throw new Error(
            "Gemini returned no query embedding."
        );
    }


    const queryVector =
        embeddingResponse.embeddings[0].values;


    // ========================================================
    // 2. VECTOR SEARCH
    // ========================================================

    const results = await collection.aggregate([

        {
            $vectorSearch: {

                index: VECTOR_INDEX,

                path: "embedding",

                queryVector: queryVector,

                numCandidates: NUM_CANDIDATES,

                limit: RETRIEVAL_LIMIT
            }
        },

        {
            $project: {

                companyName: 1,

                studentName: 1,

                year: 1,

                experienceType: 1,

                experienceId: 1,

                chunkIndex: 1,

                text: 1,

                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }

    ]).toArray();


    // ========================================================
    // 3. HANDLE NO RESULTS
    // ========================================================

    if (results.length === 0) {

        return {

            answer:
                "I couldn't find any relevant interview experiences.",

            sources: []
        };
    }


    // ========================================================
    // 4. BUILD CONTEXT
    // ========================================================

    const context = results
        .map((result, index) => {

            return `
--- EXPERIENCE ${index + 1} ---

Company: ${result.companyName}

Student: ${result.studentName || "Not specified"}

Year: ${result.year || "Not specified"}

Experience Type:
${result.experienceType || "Not specified"}

Chunk:
${result.chunkIndex}

Interview Experience:
${result.text}
`;

        })
        .join("\n");


    // ========================================================
    // 5. GENERATE ANSWER
    // ========================================================

    const prompt = `
You are an interview-experience assistant for Intervjti.

Answer the user's question using ONLY the interview
experiences provided in the context below.

Important rules:

1. Do not invent interview questions, experiences,
   companies, candidates, or details.

2. If the context does not contain enough information,
   clearly say that the available interview experiences
   do not provide enough information.

3. When possible, organize the answer clearly using
   headings and bullet points.

4. If multiple candidates reported similar questions,
   combine them rather than unnecessarily repeating them.

5. Distinguish between Online Assessment questions,
   Technical Interview questions, HR questions, and
   other interview rounds when the context supports it.

6. The information comes from candidate-submitted
   interview experiences, so do not present uncertain
   details as absolute facts.

User question:
${question}

Context:
${context}
`;


    const response =
        await ai.models.generateContent({

            model: GENERATION_MODEL,

            contents: prompt
        });


    // ========================================================
    // 6. RETURN ANSWER + SOURCES
    // ========================================================

    return {

        answer: response.text,

        sources: results.map((result) => ({

            companyName:
                result.companyName,

            studentName:
                result.studentName || "Not specified",

            year:
                result.year || "Not specified",

            experienceType:
                result.experienceType || "Not specified",

            experienceId:
                result.experienceId,

            chunkIndex:
                result.chunkIndex,

            score:
                result.score

        }))
    };
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    askRAG
};
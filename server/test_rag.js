require("dotenv").config();

const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const VECTOR_INDEX = "experience_chunk_vector_index";
const COLLECTION_NAME = "experiencechunks";

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const collection =
        mongoose.connection.db.collection(COLLECTION_NAME);

    const question =
        "What questions were asked in Morgan Stanley interviews?";

    console.log("\nQuestion:");
    console.log(question);

    // ========================================================
    // 1. EMBED USER QUERY
    // ========================================================

    const embeddingResponse =
        await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: question,
            config: {
                outputDimensionality: 768,
                taskType: "RETRIEVAL_QUERY"
            }
        });

    const queryVector =
        embeddingResponse.embeddings[0].values;

    console.log(
        "\nQuery embedding dimensions:",
        queryVector.length
    );

    // ========================================================
    // 2. VECTOR SEARCH
    // ========================================================

    const results = await collection.aggregate([
        {
            $vectorSearch: {
                index: VECTOR_INDEX,
                path: "embedding",
                queryVector: queryVector,
                numCandidates: 100,
                limit: 20
            }
        },
        {
            $project: {
                companyName: 1,
                studentName: 1,
                year: 1,
                experienceType: 1,
                chunkIndex: 1,
                text: 1,
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }
    ]).toArray();

    console.log(
        "\nRetrieved chunks:",
        results.length
    );

    // ========================================================
    // 3. BUILD CONTEXT
    // ========================================================

    const context = results
        .map((result, index) => {
            return `
--- EXPERIENCE ${index + 1} ---

Company: ${result.companyName}
Student: ${result.studentName || "Not specified"}
Year: ${result.year || "Not specified"}

${result.text}
`;
        })
        .join("\n");

    console.log("\nContext created.");

    // ========================================================
    // 4. ASK GEMINI USING RETRIEVED CONTEXT
    // ========================================================

    const prompt = `
You are an interview-experience assistant for Intervjti.

Answer the user's question using ONLY the interview experiences
provided in the context below.

If the context does not contain enough information to answer,
say that the available interview experiences do not provide
enough information.

Do not invent interview questions or details.

User question:
${question}

Context:
${context}
`;

    const response =
        await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

    // ========================================================
    // 5. DISPLAY ANSWER
    // ========================================================

    console.log("\n");
    console.log("============================================================");
    console.log("RAG ANSWER");
    console.log("============================================================");

    console.log(response.text);

    console.log("\n");
    console.log("============================================================");
    console.log("SOURCES USED");
    console.log("============================================================");

    results.forEach((result, index) => {
        console.log(
            `${index + 1}. ${result.companyName} | ` +
            `${result.studentName || "Not specified"} | ` +
            `chunk ${result.chunkIndex} | ` +
            `score ${result.score}`
        );
    });

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error("\nERROR:");
    console.error(error);

    try {
        await mongoose.disconnect();
    } catch {}

    process.exit(1);
});
require("dotenv").config();

const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const collection =
        mongoose.connection.db.collection("experiencechunks");

    const query = "What questions were asked in Morgan Stanley interviews?";

    console.log("\nQuery:");
    console.log(query);

    // Generate embedding for the user's query
    const embeddingResponse =
        await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: query,
            config: {
                outputDimensionality: 768,
                taskType: "RETRIEVAL_QUERY"
            }
        });

    const queryVector =
        embeddingResponse.embeddings[0].values;

    console.log("\nQuery embedding dimensions:", queryVector.length);

    // MongoDB Vector Search
    const results = await collection.aggregate([
        {
            $vectorSearch: {
                index: "experience_chunk_vector_index",
                path: "embedding",
                queryVector: queryVector,
                numCandidates: 100,
                limit: 5
            }
        },
        {
            $project: {
                _id: 1,
                experienceId: 1,
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

    console.log("\n============================================================");
    console.log("VECTOR SEARCH RESULTS");
    console.log("============================================================");

    results.forEach((result, index) => {
        console.log(`\n--- Result ${index + 1} ---`);

        console.log("Company:", result.companyName);
        console.log("Student:", result.studentName);
        console.log("Chunk:", result.chunkIndex);
        console.log("Score:", result.score);

        console.log("\nText:");
        console.log(result.text);
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
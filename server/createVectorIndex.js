require("dotenv").config();

const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const db = mongoose.connection.db;
    const collection = db.collection("experiencechunks");

    const index = {
        name: "experience_chunk_vector_index",
        type: "vectorSearch",
        definition: {
            fields: [
                {
                    type: "vector",
                    path: "embedding",
                    numDimensions: 768,
                    similarity: "cosine"
                },
                {
                    type: "filter",
                    path: "companyName"
                },
                {
                    type: "filter",
                    path: "year"
                },
                {
                    type: "filter",
                    path: "experienceType"
                }
            ]
        }
    };

    const result = await collection.createSearchIndex(index);

    console.log("Vector index creation started:");
    console.log(result);

    await mongoose.disconnect();
}

main().catch(error => {
    console.error("ERROR:", error);
    process.exit(1);
});
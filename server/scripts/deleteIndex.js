const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/.env" });

const MONGO_URI = process.env.MONGO_URI;

async function main() {
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;
    const collection = db.collection("experiences");

    await collection.dropSearchIndex("experience_vector_index");

    console.log("Index deleted successfully.");

    await mongoose.disconnect();
}

main().catch(err => {
    console.error("Failed:", err);
    process.exit(1);
});
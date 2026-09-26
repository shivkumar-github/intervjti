const fs = require("fs");
const path = require("path");

console.log("=== RUNTIME FILE CHECK ===");
console.log("Current directory:", process.cwd());

const modelsPath = path.join(__dirname, "../models");

console.log("Models path:", modelsPath);
console.log("Models directory:", fs.readdirSync(modelsPath));
console.log(
    "ExperienceChunk exists:",
    fs.existsSync(path.join(modelsPath, "ExperienceChunk.js"))
);
console.log(
    "experienceChunk exists:",
    fs.existsSync(path.join(modelsPath, "experienceChunk.js"))
);

console.log("==========================");

require('dotenv').config();

const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const Experience = require('../models/Experience');

const {
    processExperienceForRAG
} = require('../services/ragIngestionService');

const startWorker = async () => {
    try {
        await connectDB();

        const worker = new Worker(
            'rag-processing',
            async (job) => {
                const { experienceId } = job.data;

                console.log(
                    `Processing RAG job for experience: ${experienceId}`
                );

                const experience =
                    await Experience.findById(experienceId);

                if (!experience) {
                    throw new Error(
                        `Experience ${experienceId} not found`
                    );
                }

                await processExperienceForRAG(experience);

                console.log(
                    `RAG processing completed: ${experienceId}`
                );
            },
            {
                connection: {
                    url: process.env.REDIS_URL
                }
            }
        );

        worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed`);
        });

        worker.on('failed', (job, err) => {
            console.error(
                `Job ${job?.id} failed:`,
                err.message
            );
        });

        console.log('RAG worker is running...');
    } catch (err) {
        console.error('Worker startup failed:', err);
        process.exit(1);
    }
};

startWorker();
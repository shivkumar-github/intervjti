require('dotenv').config();

const connectDB = require('../config/db.js');
const Experience = require('../models/Experience.js');
const { generateEmbedding, buildExperienceEmbeddingText } = require('../services/embeddingServices.js');

// Small delay between Gemini calls to stay comfortably inside free-tier rate limits.
const DELAY_BETWEEN_CALLS_MS = 300;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateExperienceEmbeddings = async () => {
	try {
		await connectDB();

		// Only approved experiences, and only ones that don't already have an embedding.
		const experiences = await Experience.find({
			status: 'approved',
			embedding: { $exists: false }
		});

		if (experiences.length === 0) {
			console.log('No approved experiences are pending embedding generation.');
			process.exit(0);
		}

		console.log(`Found ${experiences.length} approved experience(s) without an embedding.`);

		let successCount = 0;
		let failCount = 0;

		for (const experience of experiences) {
			try {
				const text = buildExperienceEmbeddingText(experience);
				const embedding = await generateEmbedding(text);

				await Experience.updateOne(
					{ _id: experience._id },
					{ $set: { embedding } }
				);

				successCount++;
				console.log(`[OK] Embedded experience ${experience._id} (${experience.companyName})`);
			} catch (err) {
				failCount++;
				console.error(`[FAILED] Experience ${experience._id} (${experience.companyName}):`, err.message);
			}

			await sleep(DELAY_BETWEEN_CALLS_MS);
		}

		console.log(`Done. Success: ${successCount}, Failed: ${failCount}, Total: ${experiences.length}`);
		process.exit(0);
	} catch (err) {
		console.error('Embedding generation script failed:', err.message);
		process.exit(1);
	}
};

generateExperienceEmbeddings();
const Experience = require('../models/Experience');
const { generateEmbedding } = require('./embeddingServices');

const VECTOR_INDEX_NAME = 'experience_vector_index';
const DEFAULT_LIMIT = 5;

async function searchExperiences(query, limit = DEFAULT_LIMIT) {
	const queryEmbedding = await generateEmbedding(query);

	const results = await Experience.aggregate([
		{
			$vectorSearch: {
				index: VECTOR_INDEX_NAME,
				path: 'embedding',
				queryVector: queryEmbedding,
				filter: { status: 'approved' },
				numCandidates: Math.max(limit * 10, 100),
				limit
			}
		},
		{
			$project: {
				_id: 1,
				companyName: 1,
				batch: 1,
				preview: 1,
				content: 1,
				score: { $meta: 'vectorSearchScore' }
			}
		}
	]);

	return results.map((r) => ({
		id: r._id,
		companyName: r.companyName,
		batch: r.batch,
		preview: r.preview,
		content: r.content,
		score: r.score
	}));
}

module.exports = {
	searchExperiences
};
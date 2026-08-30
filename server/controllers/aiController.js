const { searchExperiences } = require('../services/semanticSearchService');

module.exports.searchExperiences = async (req, res) => {
	try {
		const { query, limit } = req.body;

		if (!query || typeof query !== 'string' || !query.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Query is required!'
			});
		}

		const parsedLimit = Number(limit);
		const topK = Number.isInteger(parsedLimit) && parsedLimit > 0 && parsedLimit <= 20
			? parsedLimit
			: 5;

		const results = await searchExperiences(query.trim(), topK);

		return res.status(200).json({
			success: true,
			data: results
		});
	} catch (err) {
		console.error('Error occured while performing semantic search:', err);
		return res.status(500).json({
			success: false,
			message: 'Server error occured while searching experiences!'
		});
	}
};
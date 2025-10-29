const Experience = require('../models/Experience');

module.exports.getExperiences = async (req, res) => {
	try {
		const data = await Experience.find();
		console.log('fetched details successfully.');
		res.status(200).json({
			success: true,
			data
		});

	} catch (err) {
		console.log('Error in server while fetching experiences! please try later.', err)
		res.status(500).json({
			success: false,
			message: 'Error in server while fetching experiences! please try later.'
		})
	}
};

module.exports.addExperience = async (req, res) => {
	try {
		const exp = new Experience(req.body);
		console.log('received data');
		await exp.save();
		res.status(201).json({ success: true, message: 'Experience Added Successfully.' });
		
	} catch (err) {
		console.error('Insert error, ', err);
		res.status(400).json({
			succes: false,
			message: err.message
		});
	}
};

module.exports.deleteExperience = async (req, res) => {
	try {
		const deleted = Experience.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res.status(404).json({ success: false, message: 'Experience nof found.' })
		} else {
			console.log('Can not find your entry.');
			res.status(404).json({
				success: false,
				message: 'Experience not found.'
			})
		}
	} catch (err) {
		console.log('error occured in server.', err);
		res.status(500).json({
			success: false,
			message: err.message
		})
	}
};
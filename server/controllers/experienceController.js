const Experience = require('../models/Experience');
const sanitizeHtml = require('sanitize-html');
const striptags = require('striptags');

module.exports.getExperience = async (req, res) => {
	try {
		const { id } = req.params;
		// 1. status == 'approved'
		const experience = await Experience.findById(id).lean();
		if (!experience) {
			return res.status(404).json({
				success: false,
				message: "Can not find requested experience!"
			});
		}
		if (experience.status === 'approved' || (req.user && (req.user.role === 'admin' ||  req.user.userId === String(experience.userId)))) {
			return res.status(200).json({
				success: true,
				experience,
			});
		}
		// console.log(req.user);
		// console.log((req.user && (req.user.role === 'admin' || req.user.userId === String(experience.userId))));
		
		return res.status(403).json({
			success: false,
			message: "You do not have access to this experience!"
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "An server error occured while fetching the experience!"
		});
	}
}

module.exports.getExperiences = async (req, res) => {
	try {
		// console.log('getting experiences')
		const data = await Experience.find({status:'approved'}).select("-content").sort({createdAt:-1}).lean();
		res.status(200).json({
			success: true,
			data
		});
	} catch (err) {
		console.log('Error in server while fetching experiences! please try later.', err)
		res.status(500).json({
			success: false,
			message: 'Error in server while fetching experiences! please try later.'
		});
	}
};


// upgrade all getExperiences using single function with parameters
module.exports.getUserExperiences = async (req, res) => {
	try {
		const data = await Experience.find({userId:req.user.userId}).select("-content").sort({createdAt:-1}).lean();
		res.status(200).json({
			success: true,
			data
		});
	} catch (err) {
		console.log('Error in server while fetching experiences! please try later.', err)
		res.status(500).json({
			success: false,
			message: 'Error in server while fetching experiences! please try later.'
		});
	}
}

module.exports.getExperiencesAdmin = async (req, res) => {
	try {
		const data = await Experience.find().select("-content").sort({ createdAt: -1 }).lean();
		res.status(200).json({
			success: true,
			data
		});
	} catch (err) {
		// console.log('Error in server while fetching experiences! please try later.', err)
		res.status(500).json({
			success: false,
			message: 'Error in server while fetching experiences! please try later.'
		});
	}
}

module.exports.addExperience = async (req, res) => {
	try {
		const { studentName, companyName, batch, content } = req.body;
		if (!content) {
			return res.status(400).json({
				success: false,
				message: "Content is required!"
			});
		}
		if (content.length > process.env.MAX_CONTENT_LENGTH) {
			return res.status(413).json({
				success: false, 
				message:"Experience Too Long!"
			})
		}

		const cleanContent = sanitizeHtml(content, {
			allowedTags:
				sanitizeHtml.defaults.allowedTags.concat(['img']),
			allowedAttributes: {
				a: ['href', 'target'],
				img: ['src']
			}
		});
		
		const plainText = striptags(cleanContent)
		.replace(/\s+/g, ' ')
		.trim()
		
		if (!plainText) {
			return res.status(400).json({
				success: false, 
				message:"Experience cannot be empty!"
			})
		}
		const preview =
			plainText.length > 200
				? plainText.slice(0, 200).split(' ').slice(0, -1).join(' ') + '...'
				: plainText;

		const exp = new Experience({
			userId: req.user.userId,
			studentName,
			companyName,
			batch,
			content: cleanContent,
			preview,
			status: "pending"
		});
		await exp.save();
		res.status(201).json({ success: true, message: 'Experience Added Successfully.' });
		
	} catch (err) {
		console.error('Insert error, ', err);
		res.status(500).json({
			succes: false,
			message: 'error occured while inserting data', 
		});
	}
};

module.exports.deleteExperience = async (req, res) => {
	try {
		const deleted = Experience.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res.status(404).json({ success: false, message: 'Experience nof found.' })
		} else {
			// console.log('Can not find your entry.');
			res.status(404).json({
				success: false,
				message: 'Experience not found.'
			})
		}
	} catch (err) {
		// console.log('error occured in server.', err);
		res.status(500).json({
			success: false,
			message: err.message
		})
	}
};

module.exports.updateExperienceStatus = async(req, res) => {
	try {
		const {id} = req.params;
		const { status } = req.body;
		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({
				success: false, 
				message:'Invalid status!'
			});
		}
		// console.log(id, status);

		const experience = await Experience.findById(id);

		if (!experience) {
			return res.status(400).json({
				success: false,
				message: 'Experience not found!'
			});
		}

		experience.status = status;
		experience.save();

		res.status(200).json({
			success: true, 
			message:`Experience ${status}`
		});
		
	} catch (err) {
		// console.log(err);
		res.status(500).json({
			success: false,
			message: 'Server Error!'
		});
	}
};
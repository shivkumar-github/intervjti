const Message = require('../models/Message');
module.exports.getMessages = async (req, res) => {
	try {
		const experienceId  = req.params.experienceId;
		if (!experienceId) {
			res.status(400).json({
				success: false,
				message: "experienceId is required!"
			});
		}
		const messages = await Message.find({experienceId}).sort({createdAt:-1}).populate("userId", "name");
		if (messages.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No Messages to show!"
			});
		}

		return res.status(200).json({
			success: true,
			data: messages
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Server error occured while loading messages!"
		});
	}
};

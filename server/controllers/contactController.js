const Contact = require("../models/Contact");

module.exports.addContactMessage = async(req, res) => {
	try {
		const { name, email, message } = req.body;
		if (!name || !email || !message) {
			return res.status(400).json({
				success: false,
				message:'Please Provide all the fields!'
			});
		}
		const contact = new Contact({ name, email, message });
		await contact.save();
		return res.status(201).json({
			success: true,
			message: 'Successfully added the message!'
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'An error occured in server while writing the contact message!'
		});
	}
};

module.exports.getAllContactMessages = async(req, res) => {
	try {
		const contacts = await Contact.find();
		return res.status(200).json({
			success: true,
			data:contacts
		});	
	} catch (err) {
		return res.status(500).json({
			success: false, 
			message: 'A server error occured while fetching Contact Messages!'
		});
	} 
};
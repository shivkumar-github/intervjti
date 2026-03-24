const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	experienceId: {
		type: mongoose.Schema.ObjectId, 
		ref: "Experience",
		required:true
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required:true
	},
	text: {
		type: "String", 
		required:true
	}
}, {
	timestamps:true
});

module.exports = mongoose.model("Message", messageSchema);
const mongoose = require('mongoose');
const experienceSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref:'User',
		required: true,
		index:true
	},
	studentName: {
		type: String,
		required:true
	},
	companyName: {
		type: String,
		required: true,
		trim: true
	},
	batch: {
		type: String,
		required: true,
		trim: true
	},
	preview: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default:'pending'
	}
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);

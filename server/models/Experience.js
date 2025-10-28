const mongoose = require('mongoose');
const experienceSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: true,
		unique: true,
		trim: true
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
	expText: {
		type: String,
		required: true
	}
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);

const mongoose = require('mongoose');
const experienceSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},
	studentName: {
		type: String,
		required: true
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
		default: 'pending'
	},
	reason: {
		type: String,
		enum: ['SPAM', 'DUPLICATE', 'INCOMPLETE DETAILS', 'OTHER'],
	},
	remark: {
		type: String
	},
}, { timestamps: true });

experienceSchema.set('toJSON', {
	versionKey: false,
	transform(doc, ret) {
		ret.id = ret._id;
		delete ret._id.toString();
		delete ret.__v;
	}
});

module.exports = mongoose.model('Experience', experienceSchema);

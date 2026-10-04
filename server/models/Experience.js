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

	experienceType: {
		type: String,
		trim: true,
		index: true
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

	// Legacy migration bookkeeping
	importSourcePath: {
		type: String,
		select: false,
		index: true,
		sparse: true
	},

	importSourceId: {
		type: String,
		index: true,
		sparse: true
	},

	// Source information for imported experiences
	source: {
		fileId: {
			type: String,
			index: true
		},

		fileName: {
			type: String
		},

		originalPath: {
			type: String
		},

		year: {
			type: String,
			index: true
		},

		experienceType: {
			type: String,
			index: true
		},

		companyFolder: {
			type: String,
			index: true
		}
	},

}, { timestamps: true });


experienceSchema.set('toJSON', {
	versionKey: false,

	transform(doc, ret) {
		ret.id = ret._id;
		delete ret._id;
		delete ret.__v;
	}
});


module.exports = mongoose.model('Experience', experienceSchema);
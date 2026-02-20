const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim:true
	},
	email: {
		type: String,
		required:true,
		trim:true
	},
	message: {
		type: String,
		required: true,
		maxlength:2000
	},
	isRead: {
		type:Boolean,
		default: false
	}
}, { timestamps: true });

ContactSchema.set('toJSON', {
	versionKey: false,
	transform(doc, ret) {
		ret.id = ret._id;
		delete ret._id.toString();
		delete ret.__v;
	}
});


module.exports = mongoose.model('Contact', ContactSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase:true
	},
	role: {
		type: String,
		enum: ['student', 'admin'],
		default: 'student'
	},
	verified: {
		type: Boolean,
		default: false
	},
	otp: {
		type: String,
	},
	otpExpiresAt: {
		type:Date
	}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
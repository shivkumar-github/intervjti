const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	name: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['student', 'admin'],
		default: 'student'
	},
	otp: {
		type: String,
	},
	otpExpiresAt: {
		type: Date
	},
	password: {
		type: String,
	}
}, { timestamps: true });

userSchema.pre('save', function(next) {
	this.name = this.email.split("@")[0];
	next();
});

module.exports = mongoose.model('User', userSchema);
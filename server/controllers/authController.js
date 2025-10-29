const User = require('../models/User');
const { randomInt } = require('crypto');
const { sendOtpEmail } = require('../utils/sendEmail');

function generateOtp() {
	return randomInt(1000000, 10000000).toString();
}

module.exports.sendOtp = async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
	// DOUBT: validate if mail is from our college
	try {
		let user = await User.findOne({ email });

		const otp = generateOtp();

		if (!user) {
			user = new User({ email, otp });
		} else {
			user.otp = otp;
		}
		await user.save();
		await sendOtpEmail(email, otp);

		res.status(200).json({
			success: true,
			message: 'OTP sent successfully.'
		})
	}
	catch (err) {
		console.log(err);
		res.status(500).json({
			success: false,
			message: 'Error sending OTP'
		});
	}
};

module.exports.verifyOtp = async (req, res) => {
	const { mail, otp } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) return res.status(404).json({
			success: false,
			message: 'User Not Found!'
		})

		if (user.otp != otp) res.status(400).json({
			success: false,
			message: 'OTP did not match try again!'
		})

		user.otp = undefined;
		await user.save();
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Server failed while verifying otp!'
		});
	}
};
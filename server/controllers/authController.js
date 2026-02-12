const User = require('../models/User');
const { randomInt } = require('crypto');
const { sendOtpEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

		if (user) {
			return res.status(500).json({
				success: false,
				message: 'User already exists!'
			});
		}

		if (!user) {
			user = new User({ email });
		}

		user.otp = otp;
		await user.save();
		await sendOtpEmail(email, otp);

		res.status(200).json({
			success: true,
			message: 'OTP sent successfully.'
		})
	}
	catch (err) {
		// console.log(err);
		res.status(500).json({
			success: false,
			message: 'Error sending OTP'
		});
	}
};

module.exports.verifyOtp = async (req, res) => {
	const { email, otp } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) return res.status(404).json({
			success: false,
			message: 'User Not Found!'
		})

		if (user.otp === undefined) return res.status(404).json({
			success: false,
			message: "Send an OTP to verify!"
		});

		if (user.otp !== otp) return res.status(400).json({
			success: false,
			message: 'OTP did not match try again!'
		});

		user.otp = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: 'OTP verified successfully.'
		})

	} catch (err) {
		// console.log(err);
		res.status(500).json({
			success: false,
			message: 'Server failed while verifying otp!'
		});
	}
};

module.exports.setPassword = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({
			success: false,
			message: 'user not fount'
		});
		user.password = await bcrypt.hash(password, 10);
		await user.save();
		return res.status(200).json({
			success: true,
			message: 'password Saved Successfully.'
		});
	} catch (err) {
		// console.log(err);
		res.status(500).json({
			success: false,
			message: 'error occured while setting your password retry again'
		});
	}
};

module.exports.Login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user || user.password === undefined) return res.status(404).json({
			success: false,
			message: 'user password not set, set password from sign up page to log in'
		})

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) res.status(401).json({ success: false, message: 'Invalid credintials' });

		const accessToken = jwt.sign(
			{ userId: user.id, role: user.role},
			process.env.ACCESS_SECRET,
			{ expiresIn: '15m' }
		);

		const refreshToken = jwt.sign(
			{ userId: user.id, role: user.role},
			process.env.REFRESH_SECRET,
			{ expiresIn: '7d' }
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'strict'
		});

		res.status(200).json({
			success: true,
			message: 'password verified, logging in user',
			accessToken
		});
	} catch (err) {
		res.status(500).json({ success: false, message: 'server failed while verifying your password' });
	}
};

module.exports.refresh = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return res.sendStatus(401);

	jwt.verify(refreshToken, process.env.REFRESH_SECRET,
		(err, decoded) => {
			if (err) return res.status(403).json({message:'error occured while verifying token'});
			const newAccessToken = jwt.sign(
				{ userId: decoded.userId, role: decoded.role, email:decoded.email },
				process.env.ACCESS_SECRET,
				{ expiresIn: '15m' }
			);
			res.status(200).json({ accessToken: newAccessToken });
		}
	);
};
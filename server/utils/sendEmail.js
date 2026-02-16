const nodemailer = require('nodemailer');

module.exports.sendOtpEmail = async(email, otp) => {
	const tranporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'shivkumarrajmane164@gmail.com',
			pass: process.env.GOOGLE_APP_PASSWORD // 16 character app password from google
		}
	});

	const mailOptions = {
		from: 'shivkumarrajmane164@gmail.com',
		to: email,
		subject: 'Your OTP verification code for inter-vjti.',
		text: `Your OTP is ${otp}`
	};

	await tranporter.sendMail(mailOptions);
}


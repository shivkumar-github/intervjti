const nodemailer = require('nodemailer');

module.exports.sendOtpEmail = async (email, otp) => {
	try {
		
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure:true,
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
		
		await transporter.sendMail(mailOptions);
		console.log("OTP email sent.");
	} catch (err) {
		console.log("Email sending failed!");
		throw err;
	}
};


require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db.js');
const User = require('../models/User.js');

const fixUsers = async () => {
	try {
		await connectDB();

		const users = await User.find({ name: { $exists: false } });

		for (let user of users) {
			user.name = user.email.split("@")[0];
			await user.save();
		}
		console.log("Successfully updated the users!");
		process.exit();
	} catch (err) {
		console.log("Failed to update users");


		process.exit(1);
	}
};

fixUsers();


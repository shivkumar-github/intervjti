const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const uri = process.env.MONGO_URI;
		
		await mongoose.connect(uri);
		console.log('mongoose connected successfully.', mongoose.connection.name);
	} catch (err) {
		console.error('error occured while connecting mongoose', err);
		process.exit(1);
	}
};

module.exports = connectDB;
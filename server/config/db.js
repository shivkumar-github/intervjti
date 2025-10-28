const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		// const uri = 'mongodb+srv://shivkumar:shivkumar@cluster0.utqppra.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
		const uri = 'mongodb+srv://shivkumar:shivkumar@cluster0.utqppra.mongodb.net/inter-vjti?retryWrites=true&w=majority&appName=Cluster0';
		await mongoose.connect(uri);
		console.log('mongoose connected successfully.', mongoose.connection.name);
	} catch (err) {
		console.error('error occured while connecting mongoose', err);
		process.exit(1);
	}
};

module.exports = connectDB;
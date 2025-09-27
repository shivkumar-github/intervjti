const { urlencoded } = require('body-parser');
const express = require('express');
const port = 1000;
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const cors = require('cors');

const uri = 'mongodb+srv://shivkumar:shivkumar@cluster0.utqppra.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const client = new MongoClient(uri);

let db;

const startServer = async () => {
	try {
		await client.connect();
		console.log("Connected to MongoDb");
		db = client.db('inter-vjti');
	
		app.listen(port, () => {
			console.log(port);
		})
	} catch(err) {
		console.log(err);
	}
}

startServer();

app.use(cors());
app.use(express.json());

app.get('/api/experiences', async (req, res) => {
	try {
		const experiences = db.collection('experiences');
		const data = await experiences.find().toArray();
		console.log('fetched details successfully.', data);
		res.status(200).json({
			success: true,
			data: data
		});

	} catch (err) {
		console.log('Error in server while fetching experiences! please try later.', err)
		res.status(500).json({
			success: false,
			message: 'Error in server while fetching experiences! please try later.'
		})
	}
});

app.post('/api/experiences', async (req, res) => {
	try {
		const exp = {
			userName: req.body.userName,
			companyName: req.body.companyName,
			batch: req.body.batch,
			expText: req.body.expText
		};
		console.log('received data');
		const experiences = db.collection('experiences');
		const { acknowledged, insertedId } = await experiences.insertOne(exp);
		if (acknowledged) {
			console.log('Inserted object successfully.');
			res.status(200).json({
				success: true,
				message: "Inserted your data successfully."
			});
		} else {
			res.status(500).json({
				succes: false,
				message: 'problem while inserting the data, try later.'
			});
		}
		
	} catch (err) {
		console.error('Insert error, ', err);
		res.status(500).json({
			succes: false,
			message: 'problem at server, try later.'
		});
	}
});

app.delete('/api/experinces', async(req, res) => {
	try {
		const experiences = db.collection('experiences');
		const response = await experiences.deleteOne({
			_id: new mongodb.ObjectId(req.body.id)
		});
		console.log(response);
		if (response.acknowledged && response.deletedCount) {
			console.log('deleted successfully.');
			res.status(200).json({
				success: true,
				message:'Experience deleted Successfully.'
			});
		} else {
			console.log('Can not find your entry.');
			res.status(500).json({
				success: false,
				message:'Experience not found.'
			})
		}
	} catch (err) {
		console.log('error occured in server.', err);
	}
});
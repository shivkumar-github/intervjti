const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const experienceRoutes = require('./routes/experienceRoutes');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const port = 1000;

app.use(cors({
	origin: [
		"http://localhost:5173",
		"https://intervjti.vercel.app"
	],
	
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);

app.listen(port, () => console.log('Server running on port : ', port));
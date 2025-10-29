const express = require('express');
const cors = require('cors');
const experienceRoutes = require('./routes/experienceRoutes');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');

const app = express();
const port = 1000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);

app.listen(port, () => console.log('Server running on port : ', port));
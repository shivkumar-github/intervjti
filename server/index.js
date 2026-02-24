require('dotenv').config();   // ✅ MUST BE FIRST LINE

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const experienceRoutes = require('./routes/experienceRoutes');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const port = 1000;

app.use(cors({
  origin: [
    "https://intervjti.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/contact', contactRoutes);


const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log('Server running on port:', port));
  } catch (err) {
    console.error("DB connection failed ", err);
  }
};

startServer();


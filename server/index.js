require('dotenv').config();   // MUST BE FIRST LINE

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');


// Routes
const experienceRoutes = require('./routes/experienceRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');

// DB
const connectDB = require('./config/db');
const Message = require('./models/Message');


const app = express();
// create HTTP server 
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: [
      "https://intervjti.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token!"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    socket.user = decoded;
    next();

  } catch (err) {
    next(new Error("Unauthorised!"));
  }
});

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // join room per experience
  socket.on("joinRoom", (experienceId) => {
    socket.join(experienceId);
    // console.log(`User joined room ${experienceId}`);
  });

  // send message
  socket.on("sendMessage", async(data) => {
    try {
      const { experienceId, text } = data;
      // console.log(socket.user);
      const userId = socket.user.userId;

      if (!experienceId || !text) {
        socket.emit("messageStatus", {
          success: false,
          message: "Invalid message!"
        });
        return;
      }

      // save to DB
      const newMessage = await Message.create({
        experienceId, 
        text, 
        userId
      });
      

      io.to(experienceId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error occured while sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// middlewares for app
app.use(cors({
  origin: [
    "https://intervjti.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routes for app 
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);

// start server
const PORT = process.env.PORT || 1000;
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => console.log('Server running on port:', PORT));
  } catch (err) {
    console.error("DB connection failed ", err);
  }
};

startServer();

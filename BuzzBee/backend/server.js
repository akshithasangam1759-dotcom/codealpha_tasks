require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');


// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const { storyRouter, msgRouter, notifRouter, musicRouter, vibeyRouter } = require('./routes/combined');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRouter);
app.use('/api/messages', msgRouter);
app.use('/api/notifications', notifRouter);
app.use('/api/music', musicRouter);
app.use('/api/vibey', vibeyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🐝 BuzzBee server is buzzing!', timestamp: new Date() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Socket.io
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      io.emit('user_online', { userId, online: true });
      console.log(`👤 User ${userId} joined`);
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('typing', ({ conversationId, userId, username }) => {
    socket.to(conversationId).emit('user_typing', { userId, username });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user_stop_typing');
  });

  socket.on('message_seen', ({ conversationId, messageId }) => {
    socket.to(conversationId).emit('message_seen', { messageId });
  });

  socket.on('disconnect', () => {
    let disconnectedUser;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUser) {
      io.emit('user_online', { userId: disconnectedUser, online: false });
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
🐝 ================================ 🐝
   BuzzBee Server Running!
   Port: ${PORT}
   Mode: ${process.env.NODE_ENV || 'development'}
🐝 ================================ 🐝
  `);
});

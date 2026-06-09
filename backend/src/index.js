require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { testConnection } = require('./config/database');
const routes = require('./routes/index');
const socketHandler = require('./socket/index');

const app = express();
const server = http.createServer(app);
const aiRouter = require('./routes/ai.js');

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api/ai', aiRouter);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please slow down' },
});
app.use('/api', limiter);

// Routes
app.use('/api', routes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'WorkNest API is running 🤖', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Initialize socket
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;



async function start() {
  await testConnection();
  server.listen(PORT, () => {
    console.log(`
🤖 WorkNest API Running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health: http://localhost:${PORT}/health
    `);
  });
}

start().catch(console.error);

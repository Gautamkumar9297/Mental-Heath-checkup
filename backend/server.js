const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const { 
  rateLimiters, 
  securityHeaders, 
  sanitizeInput, 
  requestLogger 
} = require('./middleware/security');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Security middleware
app.use(securityHeaders);
app.use(rateLimiters.api); // Apply general rate limiting to all routes

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Input sanitization
app.use(sanitizeInput);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_support');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Add non-prefixed routes for frontend compatibility
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/moods', require('./routes/moods'));
app.use('/sessions', require('./routes/sessions'));
app.use('/analytics', require('./routes/analytics'));
app.use('/chatbot', require('./routes/chatbot'));

// Add dashboard and other missing routes
app.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard endpoint - use /api/analytics for analytics data' });
});
app.get('/dashboard/recent-activity', (req, res) => {
  res.json({ message: 'Recent activity endpoint - use /api/sessions for session data' });
});
app.get('/dashboard/user-stats', (req, res) => {
  res.json({ message: 'User stats endpoint - use /api/analytics for user statistics' });
});
app.get('/appointments/upcoming', (req, res) => {
  res.json({ message: 'Appointments endpoint not implemented yet' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Mental Health Support System API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
require('./socket/socketHandler')(io);

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`🚀 Mental Health Support System server running on port ${port}`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
    console.log(`🔗 Socket.io ready for real-time connections`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });
};

startServer(PORT);

module.exports = app;
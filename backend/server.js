const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy for accurate IP detection (set to 1 for single proxy level)
app.set('trust proxy', 1);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import configurations and middleware
const connectDB = require('./src/config/database');
const authMiddleware = require('./src/middleware/auth');
const corsConfig = require('./src/middleware/cors');
const rateLimitConfig = require('./src/middleware/rateLimit');

// Import GraphQL setup
const { graphqlServer } = require('./src/graphql/schema');

// Import socket handlers
const socketHandlers = require('./src/socket');

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
app.use(rateLimitConfig.apiLimiter);

// CORS configuration
app.use(cors(corsConfig));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start Apollo Server and apply middleware
async function startServer() {
  await graphqlServer.start();
  graphqlServer.applyMiddleware({ app, path: '/graphql' });

  // Socket.io connection handling
  socketHandlers(io);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const PORT = process.env.PORT || 4000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);

module.exports = { app, server, io };
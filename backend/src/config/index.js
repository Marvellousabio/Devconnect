const connectDB = require('./database');
const authConfig = require('./auth');

module.exports = {
  connectDB,
  authConfig,
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/devconnect',
};
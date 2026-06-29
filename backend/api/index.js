require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/app');

let isConnected = false;

// Middleware to establish database connection in serverless context
const mongoServerlessConnector = async (req, res, next) => {
  if (isConnected && mongoose.connection.readyState === 1) return next();
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    next();
  } catch (err) {
    console.error('Serverless DB Connection Error:', err.message);
    res.status(500).json({
      status: 'error',
      errorCode: 'DATABASE_CONNECTION_FAILED',
      message: 'Database connection failed in serverless context',
      timestamp: new Date().toISOString(),
    });
  }
};

// Inject serverless connector at the root level of the app middleware stack
app.use(mongoServerlessConnector);

module.exports = app;

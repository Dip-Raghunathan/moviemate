const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const connectDB = async (retries = 5, delay = 5000) => {
  const options = {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, options);
      logger.info(`MongoDB Connected: ${conn.connection.host} (Pool limit: ${options.maxPoolSize})`);
      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i} failed: ${error.message}`);
      if (i === retries) {
        logger.error('CRITICAL: Max database connection retries reached. Shutting down.');
        process.exit(1);
      }
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;

require('dotenv').config();
const http = require('http');
const connectDB = require('./config/db');
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const mongoose = require('mongoose');
const socketUtil = require('./src/utils/socket');

const PORT = env.PORT || 5000;

let server;

// Connect to MongoDB, then boot server
connectDB().then(() => {
  const httpServer = http.createServer(app);
  socketUtil.init(httpServer);
  server = httpServer.listen(PORT, () => {
    logger.info(`========================================`);
    logger.info(`PhilixMate X Enterprise API Booted`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Port: ${PORT}`);
    logger.info(`========================================`);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection detected', { reason: reason instanceof Error ? reason.message : String(reason) });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception detected', { reason: error.message, stack: error.stack });
  process.exit(1);
});

// Graceful Shutdown Handler
const handleGracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      mongoose.connection.close().then(() => {
        logger.info('MongoDB connection closed.');
        process.exit(0);
      }).catch((err) => {
        logger.error('Failed to close MongoDB connection:', err);
        process.exit(1);
      });
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.warn('Forcing immediate shutdown due to process timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = app;

const { AppError } = require('../utils/errors');

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  const statusCode = err.statusCode || 500;
  
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] RequestId: ${req.requestId || 'N/A'} - Path: ${req.path} - Method: ${req.method}`);
    console.error(err.stack || err);
  } else {
    console.warn(`[Client Error] RequestId: ${req.requestId || 'N/A'} - Path: ${req.path} - Method: ${req.method} - Status: ${statusCode} - Message: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, 'RESOURCE_CAST_ERROR');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'This resource already exists';
    const errMsg = err.message || '';
    const field = Object.keys(err.keyValue || {})[0] || 'field';

    if (errMsg.includes('friends')) {
      message = 'You already have a friend or block relationship with this user.';
    } else if (errMsg.includes('friendrequests')) {
      message = 'A pending friend request already exists between you.';
    } else if (errMsg.includes('followers')) {
      message = 'You are already following this user.';
    } else if (errMsg.includes('premiumsubscriptions')) {
      message = 'You already have an active premium subscription.';
    } else if (errMsg.includes('paymentwebhooks')) {
      message = 'This payment transaction webhook has already been processed.';
    } else if (errMsg.includes('users')) {
      message = `An account with this ${field} already exists.`;
    } else {
      message = `A record with this ${field} already exists.`;
    }
    
    error = new AppError(message, 400, 'DUPLICATE_KEY_ERROR');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = new AppError(message, 400, 'VALIDATION_FAILED', details);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  const resStatusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = error.isOperational ? error.message : 'Something went wrong on our end';
  const details = error.details || null;

  res.status(resStatusCode).json({
    status,
    errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
};

const notFoundMiddleware = (req, res, next) => {
  const err = new AppError(`Route not found: ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(err);
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};

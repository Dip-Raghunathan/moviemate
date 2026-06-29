const crypto = require('crypto');
const logger = require('../utils/logger');

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  logger.contextStorage.run({ requestId, userId: '' }, () => {
    next();
  });
};

module.exports = requestIdMiddleware;

const jwt = require('jsonwebtoken');
const authRepository = require('../modules/authentication/auth.repository');
const env = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');
const { getDemoUserFromToken } = require('../utils/devAuth');

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Not authorized, no token provided', 'TOKEN_MISSING'));
  }

  const demoUser = getDemoUserFromToken(token);
  if (demoUser) {
    req.user = demoUser;
    const logger = require('../utils/logger');
    const store = logger.contextStorage.getStore();
    if (store) {
      store.userId = demoUser._id.toString();
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await authRepository.findById(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('User belonging to this token no longer exists', 'USER_NOT_FOUND'));
    }

    req.user = user;
    
    const logger = require('../utils/logger');
    const store = logger.contextStorage.getStore();
    if (store) {
      store.userId = user._id.toString();
    }

    next();
  } catch (error) {
    return next(new UnauthorizedError('Not authorized, token invalid or expired', 'TOKEN_INVALID'));
  }
};

module.exports = { protect };

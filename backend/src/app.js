const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const requestIdMiddleware = require('./middlewares/request-id.middleware');
const responseMiddleware = require('./middlewares/response.middleware');
const { securityHeaders, sanitizeNoSql, csrfCheck } = require('./middlewares/security.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');
const { isAllowedOrigin } = require('./utils/origin');
const v1Router = require('./api/v1.routes');

const app = express();

// --- Core Middleware ---
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(requestIdMiddleware);
app.use(responseMiddleware);
app.use(securityHeaders);
app.use(sanitizeNoSql);
app.use(csrfCheck);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin, env.CLIENT_URL)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // relaxed limit for developers testing
  handler: (req, res, next, options) => {
    res.status(429).json({
      status: 'fail',
      errorCode: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  },
});

app.use('/api/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);

// --- Routes ---
app.get('/', (req, res) => {
  return res.success({
    name: 'VX ShowMate API',
    version: '1.0.0',
    description: 'Enterprise API for VX ShowMate matchmaking and cinematic social networking'
  }, 'Welcome to VX ShowMate Enterprise API');
});

app.get('/api/health', (req, res) => {
  return res.success({ status: 'ok', env: env.NODE_ENV }, 'Server is healthy');
});
app.get('/api/v1/health', (req, res) => {
  return res.success({ status: 'ok', env: env.NODE_ENV }, 'Server is healthy');
});

// Mount modular versioned APIs
app.use('/api/v1', v1Router);

// Backward compatibility mount
app.use('/api', v1Router);

// --- Error Handlers (must be last) ---
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

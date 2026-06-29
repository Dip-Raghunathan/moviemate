const env = require('../config/env');
const { ForbiddenError } = require('../utils/errors');
const { isAllowedOrigin } = require('../utils/origin');

// 1. Set robust security headers (Helmet equivalent)
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: ui-avatars.com; font-src 'self' data: fonts.gstatic.com; connect-src 'self' *;");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Download-Options', 'noopen');
  next();
}

// 2. Prevent NoSQL Injection by sanitizing body keys starting with $ or .
function sanitizeNoSql(req, res, next) {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const k in obj) {
        if (k.startsWith('$') || k.includes('.')) {
          delete obj[k];
        } else {
          sanitize(obj[k]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
}

// 3. Simple CSRF validation via Referer/Origin headers
function csrfCheck(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    return next(new ForbiddenError('Request lacks required origin context', 'CSRF_MISSING_ORIGIN'));
  }

  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  if (!isAllowedOrigin(origin, clientUrl)) {
    return next(new ForbiddenError('Invalid request origin: CSRF validation failed', 'CSRF_INVALID_ORIGIN'));
  }

  next();
}

module.exports = {
  securityHeaders,
  sanitizeNoSql,
  csrfCheck,
};

const { AsyncLocalStorage } = require('async_hooks');
const fs = require('fs');
const path = require('path');

const contextStorage = new AsyncLocalStorage();
const logDir = path.join(process.cwd(), 'logs');

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create logs directory:', err);
}

function writeLog(category, severity, message, meta = {}) {
  const store = contextStorage.getStore() || {};
  
  // Format message if it is an Error object
  let logMessage = message;
  let errorMeta = {};
  if (message instanceof Error) {
    logMessage = message.message;
    errorMeta = {
      stack: message.stack,
      name: message.name
    };
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: store.requestId || '',
    userId: store.userId || '',
    severity,
    category,
    message: logMessage,
    environment: process.env.NODE_ENV || 'development',
    meta: { ...meta, ...errorMeta },
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  // Write to standard output/error
  const consolePrefix = `[${logEntry.timestamp}][${severity.toUpperCase()}][${category}][Req:${logEntry.requestId}]`;
  if (severity === 'error') {
    console.error(`${consolePrefix} ${logMessage}`, Object.keys(meta).length ? meta : '');
  } else {
    console.log(`${consolePrefix} ${logMessage}`, Object.keys(meta).length ? meta : '');
  }

  // Write to log files asynchronously
  try {
    fs.appendFile(path.join(logDir, `${category}.log`), logLine, (err) => {
      if (err) console.error('Failed to write log file:', err);
    });
    if (severity === 'error' && category !== 'error') {
      fs.appendFile(path.join(logDir, 'error.log'), logLine, () => {});
    }
  } catch (err) {
    // Fail silently
  }
}

const logger = {
  contextStorage,
  info: (message, meta) => writeLog('app', 'info', message, meta),
  warn: (message, meta) => writeLog('app', 'warning', message, meta),
  error: (message, meta) => writeLog('error', 'error', message, meta),
  security: (message, meta) => writeLog('security', 'warning', message, meta),
  audit: (message, meta) => writeLog('audit', 'info', message, meta),
  auth: (message, meta) => writeLog('auth', 'info', message, meta),
  jobs: (message, meta) => writeLog('jobs', 'info', message, meta),
};

module.exports = logger;

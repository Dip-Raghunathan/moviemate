const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];

const missing = requiredEnv.filter((env) => !process.env[env]);
if (missing.length > 0) {
  console.error(`CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.SMTP_FROM || '"PhilixMate" <no-reply@philixmate.app>',
  },
};

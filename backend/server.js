require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' })); // 2mb to allow base64 profile pictures

// Basic rate limiting on auth routes to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/auth', authLimiter);

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB, then start listening (only matters for local/Render run;
// Vercel's serverless adapter imports `app` directly - see api/index.js)
connectDB().then(() => {
  app.listen(PORT, () => console.log(`MovieMate API running on port ${PORT}`));
});

module.exports = app;

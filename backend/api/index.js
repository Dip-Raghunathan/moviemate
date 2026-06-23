// Vercel serverless entry point. Vercel routes all /api/* requests here
// (see vercel.json), and this re-exports the same Express app used locally.
// MongoDB connection is cached across invocations to avoid reconnecting on
// every cold-ish request, which is important for serverless functions.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler, notFound } = require('../middleware/errorHandler');

const authRoutes = require('../routes/authRoutes');
const roomRoutes = require('../routes/roomRoutes');
const userRoutes = require('../routes/userRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

let isConnected = false;
app.use(async (req, res, next) => {
  if (isConnected) return next();
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

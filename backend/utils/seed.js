require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/database/models/User');
const Room = require('../src/database/models/Room');
const Message = require('../src/database/models/Message');

/**
 * FAKE DATA REMOVED - All data is now REAL ONLY
 * 
 * This seed file is deprecated. No fake/test users will be seeded.
 * Users must create real accounts through the app.
 * Demo login credentials are available in development mode only.
 * 
 * Do NOT run this file.
 */

const COMMON_PASSWORD = 'password123';

const seed = async () => {
  console.log('SEED FUNCTION DISABLED');
  console.log('No fake data will be seeded. All data must be REAL.');
  console.log('Users must create real accounts through the app UI.');
  console.log('\nDemo login is available in development mode only.');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

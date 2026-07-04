require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/database/models/User');

const demoUsers = [
  {
    name: 'Demo Viewer',
    email: 'demo.viewer@philixmate.test',
    password: 'demo123',
    age: 25,
    gender: 'male',
    city: 'New York'
  },
  {
    name: 'Demo Creator',
    email: 'demo.creator@philixmate.test',
    password: 'demo123',
    age: 28,
    gender: 'female',
    city: 'New York'
  },
  {
    name: 'Demo Premium',
    email: 'demo.premium@philixmate.test',
    password: 'demo123',
    age: 32,
    gender: 'male',
    city: 'Los Angeles',
    isPro: true
  }
];

async function run() {
  const dbUri = process.env.MONGO_URI || 'mongodb+srv://goldenheartbritish21_db_user:8cgc55BZ06z4i1A3@cluster0.bee3tdy.mongodb.net/philixmate?retryWrites=true&w=majority';
  await mongoose.connect(dbUri);
  console.log('Connected to Database');

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created demo user: ${u.email}`);
    } else {
      console.log(`Demo user already exists: ${u.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected from Database. Setup successful.');
}

run().catch(console.error);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

/**
 * Seeds a handful of test users and rooms covering every matching scenario,
 * so you can log in and immediately see Friendship, Date, Group, and
 * Women-only rooms without manually creating 10+ accounts.
 *
 * Run with: npm run seed
 *
 * All seeded users share the password: password123
 *
 * WARNING: this wipes existing Users, Rooms, and Messages in the connected
 * database before reseeding. Don't run against a database you care about.
 */

const SHOW = {
  movie: 'Obsession',
  cinema: 'Devgn CineX',
  date: '2026-06-20',
  time: '19:30',
};

const SHOW_2 = {
  movie: 'Coolie',
  cinema: 'Cinepolis',
  date: '2026-06-21',
  time: '21:00',
};

const seedUsers = [
  { name: 'Alex Carter', email: 'alex@test.com', age: 26, gender: 'male', favoriteGenres: ['Action', 'Thriller'] },
  { name: 'Sarah Jones', email: 'sarah@test.com', age: 24, gender: 'female', favoriteGenres: ['Drama', 'Romance'] },
  { name: 'Mike Torres', email: 'mike@test.com', age: 29, gender: 'male', favoriteGenres: ['Sci-Fi'] },
  { name: 'Priya Kapoor', email: 'priya@test.com', age: 23, gender: 'female', favoriteGenres: ['Comedy'], womenOnlyMode: true },
  { name: 'Emma Wilson', email: 'emma@test.com', age: 27, gender: 'female', favoriteGenres: ['Horror'], womenOnlyMode: true },
  { name: 'John Doe', email: 'john@test.com', age: 24, gender: 'male', favoriteGenres: ['Sci-Fi', 'Action'], isPro: true, moviesAttended: 12 },
  { name: 'Tom Reed', email: 'tom@test.com', age: 31, gender: 'male', favoriteGenres: ['Action'] },
  { name: 'Nina Patel', email: 'nina@test.com', age: 25, gender: 'female', favoriteGenres: ['Romance', 'Drama'] },
];

const COMMON_PASSWORD = 'password123';

const postSystemMessage = async (roomId, text) => {
  await Message.create({ room: roomId, sender: null, senderName: 'System', text, isSystem: true });
};

const seed = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Wiping existing Users, Rooms, Messages...');

  await Promise.all([User.deleteMany({}), Room.deleteMany({}), Message.deleteMany({})]);

  console.log('Creating users...');
  const created = {};
  for (const u of seedUsers) {
    const user = await User.create({ ...u, password: COMMON_PASSWORD });
    created[u.email] = user;
    console.log(`  - ${u.name} <${u.email}> (${u.gender})`);
  }

  console.log('\nCreating rooms...');

  // Scenario 1: Friendship Solo, OPEN (1/2) - Alex waiting for a companion
  const r1 = await Room.create({
    ...SHOW,
    matchType: 'solo',
    intent: 'friendship',
    womenOnly: false,
    capacity: 2,
    status: 'open',
    members: [{ user: created['alex@test.com']._id, gender: 'male' }],
  });
  await postSystemMessage(r1._id, `Room created. Movie: ${SHOW.movie} @ ${SHOW.time}. Waiting for 1 more companion...`);
  console.log(`  - Friendship Solo OPEN (1/2): room ${r1._id}`);

  // Scenario 2: Friendship Solo, FULL (2/2) - Mike + Tom already matched, with some chat history
  const r2 = await Room.create({
    ...SHOW,
    matchType: 'solo',
    intent: 'friendship',
    womenOnly: false,
    capacity: 2,
    status: 'full',
    members: [
      { user: created['mike@test.com']._id, gender: 'male' },
      { user: created['tom@test.com']._id, gender: 'male' },
    ],
  });
  await postSystemMessage(r2._id, `Room created. Movie: ${SHOW.movie} @ ${SHOW.time}. Waiting for 1 more companion...`);
  await Message.create({ room: r2._id, sender: created['mike@test.com']._id, senderName: 'Mike Torres', text: 'Hey! Are we meeting at the ticket counter?' });
  await Message.create({ room: r2._id, sender: created['tom@test.com']._id, senderName: 'Tom Reed', text: 'Yeah, I can be there by 7:15.' });
  await postSystemMessage(r2._id, 'Room is now full. Enjoy the movie! 🎬');
  console.log(`  - Friendship Solo FULL (2/2): room ${r2._id}`);

  // Scenario 3: Date intent, OPEN (1/2) - Nina waiting for a male match
  const r3 = await Room.create({
    ...SHOW_2,
    matchType: 'solo',
    intent: 'date',
    womenOnly: false,
    capacity: 2,
    status: 'open',
    members: [{ user: created['nina@test.com']._id, gender: 'female' }],
  });
  await postSystemMessage(r3._id, `Room created. Movie: ${SHOW_2.movie} @ ${SHOW_2.time}. Waiting for 1 more companion...`);
  console.log(`  - Date Solo OPEN (1/2, waiting for male): room ${r3._id}`);

  // Scenario 4: Women-only Friendship Solo, FULL (2/2) - Priya + Emma, both opted in
  const r4 = await Room.create({
    ...SHOW,
    matchType: 'solo',
    intent: 'friendship',
    womenOnly: true,
    capacity: 2,
    status: 'full',
    members: [
      { user: created['priya@test.com']._id, gender: 'female' },
      { user: created['emma@test.com']._id, gender: 'female' },
    ],
  });
  await postSystemMessage(r4._id, `Room created. Movie: ${SHOW.movie} @ ${SHOW.time}. Waiting for 1 more companion...`);
  await Message.create({ room: r4._id, sender: created['priya@test.com']._id, senderName: 'Priya Kapoor', text: 'So glad this room is women-only, feels safer!' });
  await postSystemMessage(r4._id, 'Room is now full. Enjoy the movie! 🎬');
  console.log(`  - Women-only Friendship Solo FULL (2/2): room ${r4._id}`);

  // Scenario 5: Group Friendship, OPEN (3/4) - John + Sarah + a third, waiting on one more
  const r5 = await Room.create({
    ...SHOW,
    matchType: 'group',
    intent: 'friendship',
    womenOnly: false,
    capacity: 4,
    status: 'open',
    members: [
      { user: created['john@test.com']._id, gender: 'male' },
      { user: created['sarah@test.com']._id, gender: 'female' },
    ],
  });
  await postSystemMessage(r5._id, `Room created. Movie: ${SHOW.movie} @ ${SHOW.time}. Waiting for 2 more companions...`);
  console.log(`  - Group Friendship OPEN (2/4): room ${r5._id}`);

  console.log('\nSeed complete.\n');
  console.log('Login with any of the seeded emails above and password: password123');
  console.log('Example: alex@test.com / password123 (has an open Friendship Solo room waiting for a match)');
  console.log('Example: priya@test.com / password123 (already in a full women-only room, can open its chat)');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

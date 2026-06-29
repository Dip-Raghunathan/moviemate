require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/database/models/User');
const Room = require('../src/database/models/Room');
const Message = require('../src/database/models/Message');
const MatchingService = require('../src/modules/matching/matching.service');

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  // Clean up any old rooms for "Concurrency Test Movie"
  console.log('Cleaning up concurrency test rooms...');
  await Room.deleteMany({ movie: 'Concurrency Test Movie' });
  await Message.deleteMany({ text: /Concurrency Test Movie/ });

  // Get three REAL test users from the database
  // Update these email addresses to match actual accounts you've created in your database
  const user1 = await User.findOne({ email: 'sarah@test.com' });
  const user2 = await User.findOne({ email: 'mike@test.com' });
  const user3 = await User.findOne({ email: 'tom@test.com' });

  if (!user1 || !user2 || !user3) {
    console.error('Test users not found!');
    console.error('NO FAKE DATA - Test requires REAL accounts to exist in your database.');
    console.error('Please create real user accounts with these emails:');
    console.error('  - sarah@test.com');
    console.error('  - mike@test.com');
    console.error('  - tom@test.com');
    console.error('Or update test_concurrency.js to use different real email addresses.');
    process.exit(1);
  }

  console.log(`Test users:
  1. ${user1.name} (Female)
  2. ${user2.name} (Male)
  3. ${user3.name} (Male)`);

  const matchPrefs = {
    movie: 'Concurrency Test Movie',
    cinema: 'Cineplex Concurrency',
    date: '2026-06-28',
    time: '19:00',
    matchType: 'solo',
    intent: 'friendship',
    womenOnly: false,
  };

  // Step 1: Create an open room with Sarah already in it
  console.log('\nStep 1: Creating initial open room with Sarah...');
  const initialRoom = await Room.create({
    ...matchPrefs,
    capacity: 2,
    status: 'open',
    members: [{ user: user1._id, gender: user1.gender }],
  });
  console.log(`Initial Room Created: ${initialRoom._id} (Members count: ${initialRoom.members.length})`);

  // Step 2: Trigger concurrent startMatch operations for Mike and Tom
  console.log('\nStep 2: Triggering concurrent startMatch operations for Mike and Tom...');
  const promises = [
    MatchingService.startMatch(user2, matchPrefs),
    MatchingService.startMatch(user3, matchPrefs),
  ];

  try {
    const results = await Promise.all(promises);
    console.log('\nAll concurrent operations completed.');

    // Fetch all rooms created for this movie
    const rooms = await Room.find({ movie: 'Concurrency Test Movie' });
    console.log(`\nCreated/Found ${rooms.length} rooms in total.`);

    rooms.forEach((room, idx) => {
      console.log(`Room ${idx + 1} (ID: ${room._id}):
      - Status: ${room.status}
      - Capacity: ${room.capacity}
      - Members count: ${room.members.length}
      - Member IDs: ${room.members.map(m => m.user).join(', ')}`);
    });

    // Check capacity integrity
    const overflowed = rooms.some(r => r.members.length > r.capacity);
    const initialRoomRefetched = rooms.find(r => r._id.toString() === initialRoom._id.toString());

    if (overflowed) {
      console.error('\nFAILURE: A room exceeded its capacity!');
    } else if (initialRoomRefetched && initialRoomRefetched.members.length > 2) {
      console.error(`\nFAILURE: Initial room has ${initialRoomRefetched.members.length} members (max capacity is 2)!`);
    } else {
      console.log('\nSUCCESS: Concurrency protection verified. No room exceeded its capacity limit!');
      if (initialRoomRefetched) {
        console.log(`Initial Room has exactly ${initialRoomRefetched.members.length} members.`);
      }
    }

  } catch (error) {
    console.error('\nMatch operation failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

runTest();

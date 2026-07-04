const test = require('node:test');
const assert = require('node:assert/strict');

// Normalization function (copy of implementation in matching.service.js)
const normalizeName = (str) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

test('normalization - lowercase and trim movie/theatre name', () => {
  assert.equal(normalizeName('  Coolie  '), 'coolie');
  assert.equal(normalizeName('Dune  Part   Two'), 'dune part two');
  assert.equal(normalizeName('PVR'), 'pvr');
  assert.equal(normalizeName('Cinepolis'), 'cinepolis');
  assert.equal(normalizeName('inox'), 'inox');
});

// Show timing mapping (copy of implementation in matching.service.js)
const getShowStartHour = (showTiming) => {
  const map = {
    'Morning Show': '10:00',
    'Afternoon Show': '14:00',
    'Evening Show': '18:00',
    'Night Show': '22:00'
  };
  return map[showTiming] || '18:00';
};

test('show timing mapping', () => {
  assert.equal(getShowStartHour('Morning Show'), '10:00');
  assert.equal(getShowStartHour('Afternoon Show'), '14:00');
  assert.equal(getShowStartHour('Evening Show'), '18:00');
  assert.equal(getShowStartHour('Night Show'), '22:00');
  assert.equal(getShowStartHour('Unknown Show'), '18:00');
});

// Smart age matching priority logic (copy of implementation in matching.service.js)
function findBestAgeMatch(userAge, candidateRooms) {
  let matchedRoom = null;
  for (let ageDiff = 0; ageDiff <= 3; ageDiff++) {
    matchedRoom = candidateRooms.find(r => {
      const maxDiff = Math.max(...r.members.map(m => typeof m.age === 'number' ? Math.abs(m.age - userAge) : 0));
      return maxDiff === ageDiff;
    });
    if (matchedRoom) {
      break;
    }
  }
  return matchedRoom || null;
}

test('smart age matching hierarchy priority', () => {
  const userAge = 18;
  const candidates = [
    { id: 'room-3-years-diff', members: [{ age: 21 }, { age: 15 }] },
    { id: 'room-2-years-diff', members: [{ age: 20 }] },
    { id: 'room-1-year-diff', members: [{ age: 19 }, { age: 17 }] },
    { id: 'room-same-age', members: [{ age: 18 }] }
  ];

  // Should prioritize room-same-age (0 diff)
  let best = findBestAgeMatch(userAge, candidates);
  assert.equal(best.id, 'room-same-age');

  // If same age is removed, should choose room-1-year-diff
  const candidatesNoSameAge = candidates.filter(c => c.id !== 'room-same-age');
  best = findBestAgeMatch(userAge, candidatesNoSameAge);
  assert.equal(best.id, 'room-1-year-diff');

  // If 1 year diff is removed, should choose room-2-years-diff
  const candidatesNoSameAgeOr1 = candidatesNoSameAge.filter(c => c.id !== 'room-1-year-diff');
  best = findBestAgeMatch(userAge, candidatesNoSameAgeOr1);
  assert.equal(best.id, 'room-2-years-diff');

  // If 2 years diff is removed, should choose room-3-years-diff
  const candidatesNoSameAgeOr1Or2 = candidatesNoSameAgeOr1.filter(c => c.id !== 'room-2-years-diff');
  best = findBestAgeMatch(userAge, candidatesNoSameAgeOr1Or2);
  assert.equal(best.id, 'room-3-years-diff');

  // If all are outside ±3 years, returns undefined/null
  const candidatesFar = [{ id: 'room-4-years-diff', members: [{ age: 23 }] }];
  best = findBestAgeMatch(userAge, candidatesFar);
  assert.equal(best, null);
});

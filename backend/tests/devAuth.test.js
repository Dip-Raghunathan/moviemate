const test = require('node:test');
const assert = require('node:assert/strict');
const { getDemoUserFromToken } = require('../src/utils/devAuth');

test('returns null - no fake user profiles (all data must be REAL)', () => {
  // Demo tokens no longer return fake user profiles
  // All user data must come from real accounts in the database
  const user = getDemoUserFromToken('dev-demo-viewer-1710000000000');
  assert.equal(user, null);
});

test('returns null for non-demo tokens', () => {
  assert.equal(getDemoUserFromToken('not-a-demo-token'), null);
});

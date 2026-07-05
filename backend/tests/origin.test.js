const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedOrigin, normalizeOrigin } = require('../src/utils/origin');

test('normalizes origins by removing trailing slashes', () => {
  assert.equal(normalizeOrigin('https://app.philixmate.app/'), 'https://app.philixmate.app');
  assert.equal(normalizeOrigin('https://app.philixmate.app'), 'https://app.philixmate.app');
});

test('allows the configured client origin and localhost development origins', () => {
  assert.equal(isAllowedOrigin('https://app.philixmate.app', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('http://localhost:3000', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:3000', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('https://moviemate-delta-orpin.vercel.app', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('https://moviemate-b4e3.onrender.com', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('https://philixmate.in', 'https://app.philixmate.app'), true);
  assert.equal(isAllowedOrigin('https://www.philixmate.in', 'https://app.philixmate.app'), true);
});

test('rejects untrusted origins', () => {
  assert.equal(isAllowedOrigin('https://evil.example', 'https://app.philixmate.app'), false);
  assert.equal(isAllowedOrigin('https://app.philixmate.app.evil.com', 'https://app.philixmate.app'), false);
  assert.equal(isAllowedOrigin('https://vercel.app.evil.com', 'https://app.philixmate.app'), false);
});

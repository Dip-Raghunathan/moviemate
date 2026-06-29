import test from 'node:test';
import assert from 'node:assert/strict';
import { getDevAccounts, resolveDevAuth } from './devAuth.js';

test('returns a dev token for known demo credentials (no fake profiles)', () => {
  const result = resolveDevAuth('demo.viewer@philixmate.test', 'demo123', { enabled: true });

  assert.ok(result);
  assert.ok(result.token);
  assert.equal(result.user.email, 'demo.viewer@philixmate.test');
  assert.equal(result.user.isDemo, true);
  // No fake role or name - user data comes from real account in database
  assert.equal(result.user.role, undefined);
  assert.equal(result.user.name, undefined);
});

test('returns null for unknown credentials when auth bypass is disabled', () => {
  assert.equal(resolveDevAuth('unknown@example.com', 'wrong', { enabled: false }), null);
});

test('allows localhost demo login even when explicit dev flags are not present', () => {
  const result = resolveDevAuth('demo.viewer@philixmate.test', 'demo123', { hostname: 'localhost' });

  assert.ok(result);
  assert.equal(result.user.email, 'demo.viewer@philixmate.test');
});

test('lists the available demo credentials only (no fake profile data)', () => {
  const accounts = getDevAccounts();
  assert.equal(accounts.length, 3);
  assert.equal(accounts[0].email, 'demo.viewer@philixmate.test');
  assert.equal(accounts[0].password, 'demo123');
  // Accounts should only have email and password, no fake profile data
  assert.equal(accounts[0].role, undefined);
  assert.equal(accounts[0].name, 'Viewer');
});

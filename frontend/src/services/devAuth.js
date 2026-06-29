/**
 * ALL FAKE USER DATA REMOVED
 * 
 * Demo login credentials available for development only.
 * No fake user profiles - demo accounts must be created as REAL accounts in the app.
 * 
 * Demo credentials (for development/testing only):
 *   - demo.viewer@philixmate.test / demo123
 *   - demo.creator@philixmate.test / demo123
 *   - demo.premium@philixmate.test / demo123
 * 
 * These must exist as real accounts in your database to use.
 */

const DEV_ACCOUNTS = [
  {
    email: 'demo.viewer@philixmate.test',
    password: 'demo123',
  },
  {
    email: 'demo.creator@philixmate.test',
    password: 'demo123',
  },
  {
    email: 'demo.premium@philixmate.test',
    password: 'demo123',
  },
];

const isDevAuthEnabled = (options = {}) => {
  if (options.enabled !== undefined) {
    return options.enabled;
  }

  const hostname = options.hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return true;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false';
  }

  return false;
};

export const getDevAccounts = () => DEV_ACCOUNTS.map(acc => {
  const parts = acc.email.split('@')[0].split('.');
  const label = parts[1] || parts[0];
  return {
    id: acc.email,
    email: acc.email,
    password: acc.password,
    name: label.charAt(0).toUpperCase() + label.slice(1)
  };
});

export const resolveDevAuth = (email, password, options = {}) => {
  if (!isDevAuthEnabled(options)) {
    return null;
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPassword = (password || '').trim();

  const account = DEV_ACCOUNTS.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail && candidate.password === normalizedPassword
  );
  
  if (!account) {
    return null;
  }

  // Return minimal token info - actual user data will come from real account in database
  return {
    token: `dev-${btoa(account.email)}-${Date.now()}`,
    user: {
      email: account.email,
      isDemo: true,
      // All other user data will be fetched from the real account in the database
      // No fake profiles!
    },
  };
};

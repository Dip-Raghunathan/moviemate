/**
 * ALL FAKE USER DATA REMOVED
 * 
 * Dev auth is for development login only.
 * No hardcoded fake user profiles or data.
 * All user data must come from real registrations.
 */

function getDemoUserFromToken(token) {
  // Dev auth is disabled - all data must be REAL
  // Users must create actual accounts through the app
  
  if (!token || typeof token !== 'string') {
    return null;
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Dev auth tokens are for development only, but no fake profiles
  // This function is kept for compatibility but should rarely be used
  return null;
}

module.exports = {
  getDemoUserFromToken,
};

const User = require('../models/User');

// @route   GET /api/users/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/me
// @access  Private
// Allows updating name, age, favoriteGenres, profilePicture, womenOnlyMode.
// Gender and email are intentionally NOT editable here (gender is fixed per spec;
// email changes would need re-verification, which is out of scope for the MVP).
const updateProfile = async (req, res, next) => {
  try {
    const { name, age, favoriteGenres, profilePicture, womenOnlyMode } = req.body;

    const user = req.user;

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (Array.isArray(favoriteGenres)) user.favoriteGenres = favoriteGenres;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    // womenOnlyMode only makes sense for female users - silently ignore for male
    // accounts rather than erroring, since the UI simply won't show the toggle to them.
    if (womenOnlyMode !== undefined && user.gender === 'female') {
      user.womenOnlyMode = Boolean(womenOnlyMode);
    }

    await user.save();

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };

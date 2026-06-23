const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, favoriteGenres } = req.body;

    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ message: 'Name, email, password, age, and gender are all required' });
    }

    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: "Gender must be 'male' or 'female'" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      gender,
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // select('+password') because schema hides it by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the user exists,
    // to avoid leaking which emails are registered.
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.generateResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      // Roll back the token if email fails to send, so it can be retried cleanly
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error('Email send failed:', emailError.message);
      return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
    }

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const newToken = generateToken(user._id);

    res.json({
      message: 'Password reset successful',
      token: newToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword };

const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw new ValidationError(errorDetails, errors.array()[0].msg);
  }
  next();
};

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('gender').isIn(['male', 'female']).withMessage("Gender must be 'male' or 'female'"),
  body('favoriteGenres').optional().isArray().withMessage('favoriteGenres must be an array'),
  body('favoriteGenres.*').optional().isString().trim().isLength({ max: 30 }),
  validate,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  validate,
];

const resetPasswordRules = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

module.exports = {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
};

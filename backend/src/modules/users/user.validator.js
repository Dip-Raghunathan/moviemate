const { body, validationResult } = require('express-validator');
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

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be 1-50 characters'),
  body('age').optional().isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('favoriteGenres').optional().isArray().withMessage('favoriteGenres must be an array'),
  body('favoriteGenres.*').optional().isString().trim().isLength({ max: 30 }),
  body('profilePicture').optional().isString().isLength({ max: 2_000_000 }).withMessage('Image too large'),
  body('womenOnlyMode').optional().isBoolean().withMessage('womenOnlyMode must be true or false'),
  validate,
];

module.exports = {
  updateProfileRules,
};

const User = require('../../database/models/User');

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findById(id) {
    return User.findById(id);
  }

  async createUser(userData) {
    return User.create(userData);
  }

  async findByResetToken(hashedToken) {
    return User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');
  }
}

module.exports = new AuthRepository();

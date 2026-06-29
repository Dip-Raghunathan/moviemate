const User = require('../../database/models/User');

class UserRepository {
  async findById(id) {
    return User.findById(id);
  }

  async save(user) {
    return user.save();
  }
}

module.exports = new UserRepository();

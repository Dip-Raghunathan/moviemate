const userService = require('./user.service');
const { UserDTO } = require('./user.dto');

class UserController {
  getProfile = async (req, res, next) => {
    try {
      const user = await userService.getProfile(req.user._id);
      const response = UserDTO.fromUser(user);
      return res.success({ user: response }, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getPublicProfile = async (req, res, next) => {
    try {
      const profile = await userService.getPublicProfile(req.params.id, req.user._id);
      return res.success({ user: profile }, 'Public profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      const response = UserDTO.fromUser(user);
      return res.success({ user: response }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();

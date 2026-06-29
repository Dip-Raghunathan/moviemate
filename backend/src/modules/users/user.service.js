const userRepository = require('./user.repository');
const { NotFoundError } = require('../../utils/errors');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    return user;
  }

  async getPublicProfile(userId, requestingUserId = null) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    
    const safeUser = user.toSafeObject ? user.toSafeObject() : user;
    
    let isFollowing = false;
    if (requestingUserId) {
      const socialRepository = require('../social/social.repository');
      const follow = await socialRepository.findFollower(userId, requestingUserId);
      isFollowing = !!follow;
    }
    
    return {
      ...safeUser,
      isFollowing,
    };
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const { name, age, favoriteGenres, profilePicture, womenOnlyMode, profile, privacy } = updateData;

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (Array.isArray(favoriteGenres)) user.favoriteGenres = favoriteGenres;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    if (profile !== undefined) {
      user.profile = {
        bio: profile.bio !== undefined ? profile.bio : user.profile?.bio || '',
        coverImage: profile.coverImage !== undefined ? profile.coverImage : user.profile?.coverImage || '',
        languages: Array.isArray(profile.languages) ? profile.languages : user.profile?.languages || [],
        actors: Array.isArray(profile.actors) ? profile.actors : user.profile?.actors || [],
        directors: Array.isArray(profile.directors) ? profile.directors : user.profile?.directors || [],
      };
    }

    if (privacy !== undefined) {
      user.privacy = {
        disablePersonalization: privacy.disablePersonalization !== undefined ? Boolean(privacy.disablePersonalization) : user.privacy?.disablePersonalization || false,
        hideWatchHistory: privacy.hideWatchHistory !== undefined ? Boolean(privacy.hideWatchHistory) : user.privacy?.hideWatchHistory || false,
        hideOnlineStatus: privacy.hideOnlineStatus !== undefined ? Boolean(privacy.hideOnlineStatus) : user.privacy?.hideOnlineStatus || false,
        optOutTraining: privacy.optOutTraining !== undefined ? Boolean(privacy.optOutTraining) : user.privacy?.optOutTraining || false,
      };
    }

    // womenOnlyMode only makes sense for female users - silently ignore for male
    if (womenOnlyMode !== undefined && user.gender === 'female') {
      user.womenOnlyMode = Boolean(womenOnlyMode);
    }

    await userRepository.save(user);
    return user;
  }
}

module.exports = new UserService();

class UserDTO {
  constructor(user) {
    this.id = user.id || user._id;
    this.name = user.name;
    this.email = user.email;
    this.age = user.age;
    this.gender = user.gender;
    this.favoriteGenres = user.favoriteGenres || [];
    this.profilePicture = user.profilePicture || '';
    this.moviesAttended = user.moviesAttended || 0;
    this.isPro = user.isPro || false;
    this.womenOnlyMode = user.womenOnlyMode || false;
    this.profile = user.profile || { bio: '', coverImage: '', languages: [], actors: [], directors: [] };
    this.privacy = user.privacy || {
      disablePersonalization: false,
      hideWatchHistory: false,
      hideOnlineStatus: false,
      optOutTraining: false,
    };
    this.createdAt = user.createdAt;
  }

  static fromUser(user) {
    if (!user) return null;
    return new UserDTO(user);
  }
}

module.exports = { UserDTO };

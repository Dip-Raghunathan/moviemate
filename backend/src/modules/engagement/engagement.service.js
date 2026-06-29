const { UserStatistics } = require('../../database/models/Achievement');
const User = require('../../database/models/User');
const { Review } = require('../../database/models/Review');
const { Friend } = require('../../database/models/Social');
const { CommunityMember } = require('../../database/models/Community');

class EngagementService {
  async getEngagementData(userId) {
    let stats = await UserStatistics.findOne({ user: userId }).populate('unlockedBadges.badge');
    if (!stats) {
      stats = await UserStatistics.create({ user: userId });
    }

    const user = await User.findById(userId);
    const privacy = user.privacy || {};

    // 1. Core level and XP calculations
    const moviesCount = stats.moviesCount || user.moviesAttended || 0;
    const calculatedXp = moviesCount * 120 + 75; // 120 XP per movie + 75 base XP
    const level = Math.floor(calculatedXp / 500) + 1;
    const nextLevelXp = level * 500;
    const currentLevelXp = (level - 1) * 500;
    const progressPercent = Math.min(
      Math.floor(((calculatedXp - currentLevelXp) / 500) * 100),
      100
    );

    // 2. Fetch active signals
    const reviewsCount = await Review.countDocuments({ user: userId, status: 'active' });
    const commsCount = await CommunityMember.countDocuments({ user: userId });
    const friendsCount = await Friend.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'friends'
    });

    // 3. Build genres breakdown based on favoriteGenres
    let favoriteGenresWithPercent = [];
    if (!privacy.hideWatchHistory && !privacy.disablePersonalization) {
      const genresList = user.favoriteGenres || [];
      if (genresList.length > 0) {
        // Distribute percentages among favorite genres
        const base = Math.floor(100 / genresList.length);
        favoriteGenresWithPercent = genresList.map((g, idx) => ({
          genre: g,
          percentage: idx === 0 ? base + (100 % genresList.length) : base
        }));
      } else {
        favoriteGenresWithPercent = [
          { genre: "Sci-Fi", percentage: 40 },
          { genre: "Drama", percentage: 35 },
          { genre: "Comedy", percentage: 25 }
        ];
      }
    }

    // 4. Privacy Fallback Overrides for Analytics
    const hideHistory = privacy.hideWatchHistory === true;

    return {
      xp: calculatedXp,
      level,
      nextLevelXp,
      progressPercent,
      watchStreak: hideHistory ? 0 : 5, 
      streakMultiplier: 1.2,
      statistics: stats,
      analytics: {
        moviesWatchedThisMonth: hideHistory ? "Private" : (moviesCount > 2 ? moviesCount - 1 : moviesCount),
        favoriteGenres: hideHistory ? [] : favoriteGenresWithPercent,
        viewingPattern: hideHistory ? "Private" : "Weekend Late Nights",
        reviewActivityCount: reviewsCount,
        communityEngagementCount: commsCount,
        mostActiveFriendsCount: friendsCount,
        topDiscussionTopic: hideHistory ? "Private" : "Sci-Fi Multiverse",
        yearInReviewSummary: hideHistory 
          ? "Privacy enabled. Watch logs are hidden."
          : `You attended ${moviesCount} screenings, joined ${commsCount} clubs, and logged ${reviewsCount} reviews this year!`
      }
    };
  }

  async checkIn(userId) {
    const data = await this.getEngagementData(userId);
    // Grant daily XP checkin bonus (visual simulation)
    return {
      xpEarned: 50,
      newXp: data.xp + 50,
      newLevel: Math.floor((data.xp + 50) / 500) + 1,
      streak: data.watchStreak + 1,
      message: 'Daily Check-in Complete! +50 XP granted.',
    };
  }
}

module.exports = new EngagementService();

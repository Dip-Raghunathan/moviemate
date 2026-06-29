const { Review } = require('../../database/models/Review');
const { CommunityMember } = require('../../database/models/Community');
const Event = require('../../database/models/Event');
const User = require('../../database/models/User');

class FeedService {
  async getGlobalFeed() {
    const [reviews, memberships, events, users] = await Promise.all([
      Review.find({ status: 'active' })
        .populate('user', 'name profilePicture')
        .sort({ createdAt: -1 })
        .limit(10),
      CommunityMember.find()
        .populate('user', 'name profilePicture')
        .populate('community', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
      Event.find({ status: 'scheduled' })
        .populate('organizer', 'name profilePicture')
        .sort({ createdAt: -1 })
        .limit(10),
      User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const feed = [];

    reviews.forEach((r) => {
      if (r.user) {
        feed.push({
          id: `review:${r._id}`,
          type: 'review',
          user: r.user,
          title: `${r.user.name} reviewed ${r.movie}`,
          content: r.text || `Rated it ${r.rating}/10`,
          metadata: { movie: r.movie, rating: r.rating },
          createdAt: r.createdAt,
        });
      }
    });

    memberships.forEach((m) => {
      if (m.user && m.community) {
        feed.push({
          id: `membership:${m._id}`,
          type: 'community',
          user: m.user,
          title: `${m.user.name} joined the ${m.community.name} Community`,
          content: `Discussing all things cinema in ${m.community.name}!`,
          metadata: { community: m.community.name, avatar: m.community.avatar },
          createdAt: m.createdAt,
        });
      }
    });

    events.forEach((e) => {
      if (e.organizer) {
        feed.push({
          id: `event:${e._id}`,
          type: 'event',
          user: e.organizer,
          title: `${e.organizer.name} scheduled a Match Meetup`,
          content: `${e.title} for the movie "${e.movie}" at ${e.theatre}`,
          metadata: { movie: e.movie, location: e.theatre, date: e.showtime },
          createdAt: e.createdAt,
        });
      }
    });

    users.forEach((u) => {
      feed.push({
        id: `user:${u._id}`,
        type: 'user',
        user: { _id: u._id, name: u.name, profilePicture: u.profilePicture },
        title: `Welcome our newest VX ShowMate, ${u.name}!`,
        content: `Favorite genres: ${u.favoriteGenres?.join(', ') || 'all movies'}`,
        metadata: { genres: u.favoriteGenres },
        createdAt: u.createdAt,
      });
    });

    // Sort feed chronologically
    return feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
  }

  async getRecommendations(user) {
    const { getRecommendationsForUser } = require('./feed.recommendations');
    return getRecommendationsForUser(user);
  }
}

module.exports = new FeedService();

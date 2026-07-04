const MovieStats = require('../../database/models/MovieStats');
const TheatreStats = require('../../database/models/TheatreStats');
const ActivityFeed = require('../../database/models/ActivityFeed');
const CommunityNote = require('../../database/models/CommunityNote');

class DiscoverService {
  async getDiscoverFeed() {
    const trendingMovies = await MovieStats.find()
      .sort({ matchCount: -1 })
      .limit(10);

    const popularTheatres = await TheatreStats.find()
      .sort({ matchCount: -1 })
      .limit(10);

    const recentActivity = await ActivityFeed.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const communityNotes = await CommunityNote.find()
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      trendingMovies: trendingMovies.map(m => m.movieName),
      popularTheatres: popularTheatres.map(t => t.theatreName),
      recentActivity: recentActivity.map(a => ({
        message: a.message,
        createdAt: a.createdAt
      })),
      communityNotes: communityNotes.map(n => ({
        id: n._id,
        userName: n.userName,
        text: n.text,
        createdAt: n.createdAt
      }))
    };
  }

  async postNote(userName, text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Note text cannot be empty');
    }

    const note = await CommunityNote.create({
      userName,
      text: text.trim()
    });

    // Prune to top 20 notes
    const allNotes = await CommunityNote.find().sort({ createdAt: -1 });
    if (allNotes.length > 20) {
      const idsToDelete = allNotes.slice(20).map(n => n._id);
      await CommunityNote.deleteMany({ _id: { $in: idsToDelete } });
    }

    return note;
  }
}

module.exports = new DiscoverService();

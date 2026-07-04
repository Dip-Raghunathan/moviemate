const Watchlist = require('../../database/models/Watchlist');
const MovieStats = require('../../database/models/MovieStats');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

class WatchlistService {
  async saveMovie(userId, movieName) {
    if (!movieName) {
      throw new BadRequestError('Movie name is required');
    }

    const trimmedName = movieName.trim();
    // Case-insensitive query to find duplicate
    const existing = await Watchlist.findOne({
      userId,
      movieName: { $regex: new RegExp('^' + trimmedName + '$', 'i') }
    });

    if (existing) {
      throw new BadRequestError('Already Added', 'ALREADY_ADDED');
    }

    const watchlist = await Watchlist.create({
      userId,
      movieName: trimmedName
    });

    return watchlist;
  }

  async getWatchlist(userId) {
    return Watchlist.find({ userId }).sort({ createdAt: -1 });
  }

  async deleteMovie(userId, id) {
    const item = await Watchlist.findOne({ _id: id, userId });
    if (!item) {
      throw new NotFoundError('Watchlist item not found');
    }
    await Watchlist.deleteOne({ _id: id });
    return { success: true };
  }

  async getSuggestions(q) {
    if (!q) return [];
    
    // Find up to 10 movie stats with movieName starting with q
    const matched = await MovieStats.find({
      movieName: { $regex: new RegExp('^' + q, 'i') }
    })
    .sort({ matchCount: -1 })
    .limit(10);

    return matched.map(m => m.movieName);
  }
}

module.exports = new WatchlistService();

const watchlistService = require('./watchlist.service');

class WatchlistController {
  saveMovie = async (req, res, next) => {
    try {
      const watchlist = await watchlistService.saveMovie(req.user._id, req.body.movieName);
      return res.success({ watchlist }, 'Movie saved to watchlist');
    } catch (error) {
      next(error);
    }
  };

  getWatchlist = async (req, res, next) => {
    try {
      const list = await watchlistService.getWatchlist(req.user._id);
      return res.success({ watchlist: list }, 'Watchlist retrieved');
    } catch (error) {
      next(error);
    }
  };

  deleteMovie = async (req, res, next) => {
    try {
      const result = await watchlistService.deleteMovie(req.user._id, req.params.id);
      return res.success(result, 'Movie removed from watchlist');
    } catch (error) {
      next(error);
    }
  };

  getSuggestions = async (req, res, next) => {
    try {
      const suggestions = await watchlistService.getSuggestions(req.query.q);
      return res.success({ suggestions }, 'Watchlist suggestions retrieved');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WatchlistController();

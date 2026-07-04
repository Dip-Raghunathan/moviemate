const express = require('express');
const router = express.Router();
const watchlistController = require('./watchlist.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.post('/', watchlistController.saveMovie);
router.get('/', watchlistController.getWatchlist);
router.get('/suggest', watchlistController.getSuggestions);
router.delete('/:id', watchlistController.deleteMovie);

module.exports = router;

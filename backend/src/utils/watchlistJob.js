const Watchlist = require('../database/models/Watchlist');
const Show = require('../database/models/Show');
const Notification = require('../database/models/Notification');
const { sendNotification } = require('./notificationHelper');

const checkWatchlistReminders = async () => {
  try {
    const now = new Date();
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Get all watchlist items and populate user details
    const watchlistItems = await Watchlist.find().populate('userId');
    for (const item of watchlistItems) {
      if (!item.userId) continue;

      const normalizedMovie = item.movieName.trim().toLowerCase();

      // Find any upcoming shows for this movie
      const shows = await Show.find({
        movie: { $regex: new RegExp(`^${normalizedMovie}$`, 'i') }
      });

      for (const show of shows) {
        // Parse show date and time. Show date format: 'YYYY-MM-DD', time format: 'HH:mm'
        const showStart = new Date(`${show.date}T${show.time}:00`);
        const hoursDiff = (showStart.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Notify if show starts in the next 3 hours
        if (hoursDiff > 0 && hoursDiff <= 3) {
          // Prevent duplicate notification in the last 12 hours
          const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          const alreadySent = await Notification.findOne({
            recipient: item.userId._id,
            type: 'watchlist_reminder',
            body: new RegExp(item.movieName, 'i'),
            createdAt: { $gte: twelveHoursAgo }
          });

          if (!alreadySent) {
            await sendNotification({
              recipient: item.userId._id,
              type: 'watchlist_reminder',
              title: 'Watchlist Reminder',
              body: `🎬 Your watchlisted movie "${item.movieName}" is starting soon at ${show.time}!`,
              deepLink: '/watchlist',
              priority: 'normal'
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[Watchlist Reminder Job] Failed:', err);
  }
};

const startWatchlistReminders = () => {
  // Run check every 30 minutes
  setInterval(checkWatchlistReminders, 30 * 60 * 1000);
  // Run initial check on server boot
  setTimeout(checkWatchlistReminders, 10 * 1000);
};

module.exports = { startWatchlistReminders };

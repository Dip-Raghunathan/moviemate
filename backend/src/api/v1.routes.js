const express = require('express');
const router = express.Router();

const authRouter = require('../modules/authentication/auth.routes');
const userRouter = require('../modules/users/user.routes');
const matchingRouter = require('../modules/matching/matching.routes');
const chatRouter = require('../modules/chat/chat.routes');
const socialRouter = require('../modules/social/social.routes');
const communityRouter = require('../modules/communities/community.routes');
const eventRouter = require('../modules/events/event.routes');
const reviewRouter = require('../modules/reviews/review.routes');
const feedRouter = require('../modules/feed/feed.routes');
const engagementRouter = require('../modules/engagement/engagement.routes');
const billingRouter = require('../modules/billing/billing.routes');
const watchlistRouter = require('../modules/watchlist/watchlist.routes');
const discoverRouter = require('../modules/discover/discover.routes');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/rooms', matchingRouter);
router.use('/rooms', chatRouter);
router.use('/social', socialRouter);
router.use('/communities', communityRouter);
router.use('/events', eventRouter);
router.use('/reviews', reviewRouter);
router.use('/feed', feedRouter);
router.use('/engagement', engagementRouter);
router.use('/billing', billingRouter);
router.use('/watchlist', watchlistRouter);
router.use('/discover', discoverRouter);

// Serverless Cron Route for Watchlist Reminders
const { checkWatchlistReminders } = require('../utils/watchlistJob');
router.get('/cron/watchlist-reminders', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized'
      });
    }
    await checkWatchlistReminders();
    return res.status(200).json({
      status: 'success',
      message: 'Watchlist reminders executed successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

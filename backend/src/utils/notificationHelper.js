const Notification = require('../database/models/Notification');
const socketUtil = require('./socket');

const sendNotification = async ({ recipient, sender, type, title, body, deepLink = '', priority = 'normal' }) => {
  try {
    // Prevent duplicate notifications for the same event type, recipient, and body in the last 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const existing = await Notification.findOne({
      recipient,
      type,
      title,
      body,
      createdAt: { $gte: tenSecondsAgo }
    });

    if (existing) {
      return existing;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      body,
      deepLink,
      priority
    });

    // Populate sender details for frontend avatar display
    let populatedNotification = notification;
    if (sender) {
      populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name profilePicture isPro');
    }

    // Emit live over websocket
    const io = socketUtil.getIO();
    if (io) {
      io.to(`user_${recipient}`).emit('notification_received', populatedNotification);
    }

    return notification;
  } catch (err) {
    console.error('[Notification Helper] Failed to send notification:', err);
  }
};

module.exports = { sendNotification };

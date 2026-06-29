const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    movie: {
      type: String,
      required: true,
      trim: true,
    },
    theatre: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'New York',
      trim: true,
    },
    showtime: {
      type: Date,
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

// Indexes
eventSchema.index({ movie: 1, showtime: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);

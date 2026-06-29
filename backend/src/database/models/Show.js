const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    time: {
      type: String, // stored as 'HH:mm'
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, theatre: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Show', showSchema);

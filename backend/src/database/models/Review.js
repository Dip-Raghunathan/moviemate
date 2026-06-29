const mongoose = require('mongoose');

// --- Review Schema ---
const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating scale of 1-10 is required'],
      min: 1,
      max: 10,
    },
    text: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'flagged', 'hidden'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from writing multiple reviews on the same movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
reviewSchema.index({ movie: 1, rating: -1 });

// --- Comment Schema ---
const commentSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {
  Review,
  Comment,
};

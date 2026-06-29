const mongoose = require('mongoose');

// --- City Schema ---
const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

citySchema.index({ name: 1, country: 1 }, { unique: true });

// --- Theatre Schema ---
const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

theatreSchema.index({ name: 1, city: 1 }, { unique: true });

const City = mongoose.model('City', citySchema);
const Theatre = mongoose.model('Theatre', theatreSchema);

module.exports = {
  City,
  Theatre,
};

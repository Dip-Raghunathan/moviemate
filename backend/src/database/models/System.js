const mongoose = require('mongoose');

// --- Feature Flag Schema ---
const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// --- System Setting Schema ---
const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

module.exports = {
  FeatureFlag,
  SystemSetting,
};

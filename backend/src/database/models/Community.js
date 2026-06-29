const mongoose = require('mongoose');

// --- Community Schema ---
const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    privacy: {
      type: String,
      enum: ['public', 'private', 'invite-only'],
      default: 'public',
    },
    avatar: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Search Index on Community Names
communitySchema.index({ name: 'text', description: 'text' });

// --- Community Member Schema ---
const communityMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'moderator', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

communityMemberSchema.index({ user: 1, community: 1 }, { unique: true });
communityMemberSchema.index({ community: 1, role: 1 });

const Community = mongoose.model('Community', communitySchema);
const CommunityMember = mongoose.model('CommunityMember', communityMemberSchema);

module.exports = {
  Community,
  CommunityMember,
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password by default
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 16,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    city: {
      type: String,
      trim: true,
      default: 'Delhi',
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: '', // store URL or base64
    },
    moviesAttended: {
      type: Number,
      default: 0,
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    womenOnlyMode: {
      type: Boolean,
      default: false,
    },
    // --- Enterprise Evolution Fields ---
    phone: {
      type: String,
      trim: true,
      // unique + sparse compound index will be handled below to allow multiple null/empty values
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    profile: {
      bio: { type: String, default: '', maxlength: 500 },
      coverImage: { type: String, default: '' },
      languages: { type: [String], default: [] },
      actors: { type: [String], default: [] },
      directors: { type: [String], default: [] },
    },
    privacy: {
      disablePersonalization: { type: Boolean, default: false },
      hideWatchHistory: { type: Boolean, default: false },
      hideOnlineStatus: { type: Boolean, default: false },
      optOutTraining: { type: Boolean, default: false },
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin', 'superadmin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    version: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    resetOTP: {
      type: String,
      select: false,
    },
    resetOTPExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes
// Unique sparse index on phone to prevent duplicate phone numbers while allowing empty phones
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
// Index on status and isDeleted for active user queries
userSchema.index({ status: 1, isDeleted: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('version')) {
    this.version += 1;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate a password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken; // unhashed token goes in the email link
};

// Strip sensitive fields when converting to JSON
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    age: this.age,
    gender: this.gender,
    city: this.city || 'Delhi',
    favoriteGenres: this.favoriteGenres,
    profilePicture: this.profilePicture,
    moviesAttended: this.moviesAttended,
    isPro: this.isPro,
    womenOnlyMode: this.womenOnlyMode,
    phone: this.phone || '',
    isEmailVerified: this.isEmailVerified,
    isVerified: this.isVerified,
    isPhoneVerified: this.isPhoneVerified,
    profile: this.profile,
    privacy: this.privacy || {
      disablePersonalization: false,
      hideWatchHistory: false,
      hideOnlineStatus: false,
      optOutTraining: false,
    },
    role: this.role || 'user',
    status: this.status,
    version: this.version,
    isDeleted: this.isDeleted,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

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
    // Gender is required and fixed once set (enforced in controller, not just schema)
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: '', // store URL or base64; empty = use initials avatar in UI
    },
    moviesAttended: {
      type: Number,
      default: 0,
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    // Safety preference: only meaningful for female users on Friendship rooms.
    // When true, this user will only ever be matched into rooms where every
    // member is female (Friendship Solo or Group). Ignored for Date intent
    // (Date is inherently opposite-gender) and ignored for male users.
    womenOnlyMode: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
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
    favoriteGenres: this.favoriteGenres,
    profilePicture: this.profilePicture,
    moviesAttended: this.moviesAttended,
    isPro: this.isPro,
    womenOnlyMode: this.womenOnlyMode,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

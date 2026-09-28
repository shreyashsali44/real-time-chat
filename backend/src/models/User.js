const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
  },
  socketId: {
    type: String,
    default: null,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

userSchema.index({ username: 1 });
userSchema.index({ isOnline: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
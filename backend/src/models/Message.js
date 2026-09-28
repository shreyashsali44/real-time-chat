const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  sender: {
    type: String,
    required: [true, 'Sender username is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  room: {
    type: String,
    default: 'general',
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  readBy: [{
    username: String,
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
messageSchema.index({ room: 1, timestamp: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ messageId: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
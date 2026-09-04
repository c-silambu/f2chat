import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: 'anonymous'
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'in_chat', 'banned'],
    default: 'active'
  },
  banReason: {
    type: String,
    default: null
  },
  banExpiresAt: {
    type: Date,
    default: null
  },
  totalChats: {
    type: Number,
    default: 0
  },
  totalReportsReceived: {
    type: Number,
    default: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ status: 1 });
userSchema.index({ lastSeen: -1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

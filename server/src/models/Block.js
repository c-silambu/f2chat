import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blockerSessionId: {
    type: String,
    required: true,
    index: true
  },
  blockedSessionId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    default: 'user_initiated'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24hr block
    index: { expires: '1s' } // TTL index for automatic expiration
  }
}, {
  timestamps: true
});

blockSchema.index({ blockerSessionId: 1, blockedSessionId: 1 }, { unique: true });

export const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);

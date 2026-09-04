import mongoose from 'mongoose';

const moderationEventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  roomId: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['text_filter', 'rate_limit', 'client_flag', 'spam_detected', 'admin_action'],
    required: true
  },
  action: {
    type: String,
    enum: ['warn', 'block_message', 'disconnect', 'temporary_ban', 'flag_for_review'],
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  confidence: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

moderationEventSchema.index({ createdAt: -1 });

export const ModerationEvent = mongoose.models.ModerationEvent || mongoose.model('ModerationEvent', moderationEventSchema);

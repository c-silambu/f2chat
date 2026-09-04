import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterSessionId: {
    type: String,
    required: true,
    index: true
  },
  reportedSessionId: {
    type: String,
    required: true,
    index: true
  },
  roomId: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    enum: [
      'nudity_sexual',
      'harassment',
      'hate_abuse',
      'spam_scam',
      'underage_concern',
      'bot_behavior',
      'other'
    ],
    required: true
  },
  details: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
    default: 'pending',
    index: true
  },
  moderatorNotes: {
    type: String,
    default: ''
  },
  moderatorId: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

reportSchema.index({ createdAt: -1 });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

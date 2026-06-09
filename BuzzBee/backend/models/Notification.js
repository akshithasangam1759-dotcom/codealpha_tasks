const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['reaction', 'comment', 'follow', 'story_reaction', 'message', 'mention', 'comment_like'],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', default: null },
  message: { type: String, default: '' },
  reactionType: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

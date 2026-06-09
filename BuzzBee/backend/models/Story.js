const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, default: '', maxlength: 200 },
  musicTrack: {
    id: String,
    name: String,
    artist: String,
    albumArt: String,
    previewUrl: String,
  },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);

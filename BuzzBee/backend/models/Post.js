const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 500 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['music', 'image', 'text', 'mood', 'playlist', 'artist_update'],
    default: 'text',
  },
  caption: { type: String, default: '', maxlength: 2000 },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'audio', ''], default: '' },
  musicTrack: {
    id: String,
    name: String,
    artist: String,
    album: String,
    albumArt: String,
    previewUrl: String,
    duration: Number,
    source: { type: String, default: 'jamendo' },
  },
  playlist: [{
    id: String,
    name: String,
    artist: String,
    albumArt: String,
    previewUrl: String,
  }],
  mood: { type: String, default: '' },
  tags: [{ type: String }],
  reactions: {
    slay: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    drip: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    vibe: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    w: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mood: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fire: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  comments: [commentSchema],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);

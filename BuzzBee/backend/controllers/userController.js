const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatar isOnline')
      .populate('following', 'username displayName avatar isOnline');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = await Post.find({ author: user._id, isPublic: true })
      .sort('-createdAt')
      .populate('author', 'username displayName avatar');

    res.json({ success: true, user, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow/Unfollow user
exports.followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
      res.json({ success: true, following: false, message: 'Unfollowed' });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });

      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.username} started following you`,
      });

      // Emit socket notification
      if (req.io) {
        req.io.to(req.params.id).emit('notification', {
          type: 'follow',
          sender: { username: req.user.username, avatar: req.user.avatar },
          message: `${req.user.username} started following you`,
        });
      }

      res.json({ success: true, following: true, message: 'Followed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).select('username displayName avatar role isOnline isVerified followers').limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get suggested users
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] },
    }).select('username displayName avatar role isOnline isVerified followers').limit(10).sort({ followers: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add favorite track
exports.addFavoriteTrack = async (req, res) => {
  try {
    const { track } = req.body;
    const user = await User.findById(req.user._id);
    const exists = user.favoriteTracks.find(t => t.id === track.id);
    if (exists) {
      user.favoriteTracks = user.favoriteTracks.filter(t => t.id !== track.id);
    } else {
      user.favoriteTracks.unshift(track);
      if (user.favoriteTracks.length > 50) user.favoriteTracks.pop();
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, favoriteTracks: user.favoriteTracks, isFavorite: !exists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add recently played
exports.addRecentlyPlayed = async (req, res) => {
  try {
    const { track } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyPlayed: { $each: [track], $position: 0, $slice: 20 } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending users (most followers)
exports.getTrendingUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $addFields: { followersCount: { $size: '$followers' } } },
      { $sort: { followersCount: -1 } },
      { $limit: 12 },
      { $project: { username: 1, displayName: 1, avatar: 1, role: 1, isVerified: 1, followersCount: 1, isOnline: 1 } },
    ]);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

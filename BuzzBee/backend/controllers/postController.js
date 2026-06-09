const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create post
exports.createPost = async (req, res) => {
  try {
    const { type, caption, mood, tags, musicTrack, playlist } = req.body;
    const postData = {
      author: req.user._id,
      type: type || 'text',
      caption: caption || '',
      mood: mood || '',
    };

    if (tags) postData.tags = JSON.parse(tags);
    if (musicTrack) postData.musicTrack = JSON.parse(musicTrack);
    if (playlist) postData.playlist = JSON.parse(playlist);

    if (req.file) {
      postData.mediaUrl = req.file.path;
      postData.mediaType = req.file.mimetype.startsWith('image') ? 'image'
        : req.file.mimetype.startsWith('video') ? 'video' : 'audio';
    }

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate('author', 'username displayName avatar role isVerified');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feed
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const currentUser = await User.findById(req.user._id);
    const feedUsers = [...currentUser.following, req.user._id];

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'username displayName avatar role isVerified isOnline' },
    };

    const result = await Post.paginate({ author: { $in: feedUsers }, isPublic: true }, options);
    res.json({ success: true, posts: result.docs, totalPages: result.totalPages, currentPage: result.page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get explore posts
exports.getExplorePosts = async (req, res) => {
  try {
    const { page = 1, limit = 12, type } = req.query;
    const query = { isPublic: true };
    if (type && type !== 'all') query.type = type;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'username displayName avatar role isVerified' },
    };

    const result = await Post.paginate(query, options);
    res.json({ success: true, posts: result.docs, totalPages: result.totalPages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar role isVerified isOnline')
      .populate('comments.user', 'username displayName avatar');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    React to post
exports.reactToPost = async (req, res) => {
  try {
    const { reactionType } = req.body;
    const validReactions = ['slay', 'drip', 'vibe', 'w', 'ate', 'mood', 'fire'];

    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const reactionArray = post.reactions[reactionType];
    const hasReacted = reactionArray.some(id => id.toString() === userId);

    // Remove all existing reactions from this user first
    for (const type of validReactions) {
      post.reactions[type] = post.reactions[type].filter(id => id.toString() !== userId);
    }

    if (!hasReacted) {
      post.reactions[reactionType].push(req.user._id);

      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'reaction',
          post: post._id,
          reactionType,
          message: `${req.user.username} reacted ${reactionType} to your post`,
        });

        if (req.io) {
          req.io.to(post.author.toString()).emit('notification', {
            type: 'reaction',
            sender: { username: req.user.username, avatar: req.user.avatar },
            reactionType,
            message: `${req.user.username} reacted to your post`,
          });
        }
      }
    }

    await post.save({ validateBeforeSave: false });
    res.json({ success: true, reactions: post.reactions, reacted: !hasReacted, reactionType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save({ validateBeforeSave: false });

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username displayName avatar');
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        message: `${req.user.username} commented on your post`,
      });

      if (req.io) {
        req.io.to(post.author.toString()).emit('notification', {
          type: 'comment',
          sender: { username: req.user.username, avatar: req.user.avatar },
          message: `${req.user.username} commented on your post`,
        });
      }
    }

    res.json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.deleteOne();
    await post.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/unsave post
exports.savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: req.params.id } });
      await Post.findByIdAndUpdate(req.params.id, { $pull: { savedBy: req.user._id } });
      res.json({ success: true, saved: false });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedPosts: req.params.id } });
      await Post.findByIdAndUpdate(req.params.id, { $addToSet: { savedBy: req.user._id } });
      res.json({ success: true, saved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'username displayName avatar role isVerified' },
    });
    res.json({ success: true, posts: user.savedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

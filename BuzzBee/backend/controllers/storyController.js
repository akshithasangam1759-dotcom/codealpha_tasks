const Story = require('../models/Story');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create story
exports.createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Media is required for story' });

    const { caption, musicTrack } = req.body;
    const storyData = {
      author: req.user._id,
      mediaUrl: req.file.path,
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      caption: caption || '',
    };
    if (musicTrack) storyData.musicTrack = JSON.parse(musicTrack);

    const story = await Story.create(storyData);
    const populated = await Story.findById(story._id).populate('author', 'username displayName avatar');
    res.status(201).json({ success: true, story: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stories feed (following + own)
exports.getStoriesFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const feedUsers = [...currentUser.following, req.user._id];

    const stories = await Story.find({
      author: { $in: feedUsers },
      expiresAt: { $gt: new Date() },
    }).populate('author', 'username displayName avatar isOnline').sort('-createdAt');

    // Group by user
    const grouped = {};
    stories.forEach(story => {
      const uid = story.author._id.toString();
      if (!grouped[uid]) grouped[uid] = { user: story.author, stories: [] };
      grouped[uid].stories.push(story);
    });

    const storyGroups = Object.values(grouped);

    // Move own stories first
    const ownIndex = storyGroups.findIndex(g => g.user._id.toString() === req.user._id.toString());
    if (ownIndex > 0) {
      const [own] = storyGroups.splice(ownIndex, 1);
      storyGroups.unshift(own);
    }

    res.json({ success: true, storyGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    View story
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save({ validateBeforeSave: false });
    }

    res.json({ success: true, viewCount: story.viewers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    React to story
exports.reactToStory = async (req, res) => {
  try {
    const { emoji } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    story.reactions = story.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    story.reactions.push({ user: req.user._id, emoji });
    await story.save({ validateBeforeSave: false });

    if (story.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: story.author,
        sender: req.user._id,
        type: 'story_reaction',
        story: story._id,
        message: `${req.user.username} reacted ${emoji} to your story`,
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete story
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

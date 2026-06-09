const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const other = await User.findById(userId);
    if (!other) return res.status(404).json({ success: false, message: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate('participants', 'username displayName avatar isOnline lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username displayName avatar isOnline lastSeen');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username displayName avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort('-lastMessageAt');

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages in conversation
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false })
      .populate('sender', 'username displayName avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const msgData = {
      conversation: conversationId,
      sender: req.user._id,
      text: text || '',
      seenBy: [req.user._id],
    };

    if (req.file) {
      msgData.mediaUrl = req.file.path;
      msgData.mediaType = 'image';
    }

    const message = await Message.create(msgData);
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: Date.now(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'username displayName avatar');

    // Emit to conversation room
    if (req.io) {
      const otherParticipant = conversation.participants.find(p => p.toString() !== req.user._id.toString());
      req.io.to(conversationId).emit('new_message', populated);
      req.io.to(otherParticipant.toString()).emit('notification', {
        type: 'message',
        sender: { username: req.user.username, avatar: req.user.avatar },
        message: `${req.user.username} sent you a message`,
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    message.isDeleted = true;
    message.text = 'This message was deleted';
    await message.save({ validateBeforeSave: false });

    if (req.io) req.io.to(message.conversation.toString()).emit('message_deleted', { messageId: message._id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

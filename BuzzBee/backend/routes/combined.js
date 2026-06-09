// routes/stories.js
const express = require('express');
const storyRouter = express.Router();
const { createStory, getStoriesFeed, viewStory, reactToStory, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { uploadStory } = require('../config/cloudinary');

storyRouter.get('/', protect, getStoriesFeed);
storyRouter.post('/', protect, uploadStory.single('media'), createStory);
storyRouter.post('/:id/view', protect, viewStory);
storyRouter.post('/:id/react', protect, reactToStory);
storyRouter.delete('/:id', protect, deleteStory);

// routes/messages.js
const msgRouter = express.Router();
const { getOrCreateConversation, getConversations, getMessages, sendMessage, deleteMessage } = require('../controllers/messageController');
const { uploadMessage } = require('../config/cloudinary');

msgRouter.get('/conversations', protect, getConversations);
msgRouter.get('/conversations/:userId/open', protect, getOrCreateConversation);
msgRouter.get('/:conversationId', protect, getMessages);
msgRouter.post('/:conversationId', protect, uploadMessage.single('media'), sendMessage);
msgRouter.delete('/:messageId', protect, deleteMessage);

// routes/notifications.js
const notifRouter = express.Router();
const { getNotifications, markRead, getUnreadCount, deleteNotification } = require('../controllers/notificationController');

notifRouter.get('/', protect, getNotifications);
notifRouter.put('/read', protect, markRead);
notifRouter.get('/unread-count', protect, getUnreadCount);
notifRouter.delete('/:id', protect, deleteNotification);

// routes/music.js
const musicRouter = express.Router();
const { getTrendingTracks, searchTracks, getTrendingArtists, getArtistTracks, getGenres, getRecommended } = require('../controllers/musicController');

musicRouter.get('/trending', protect, getTrendingTracks);
musicRouter.get('/search', protect, searchTracks);
musicRouter.get('/artists', protect, getTrendingArtists);
musicRouter.get('/artist-tracks', protect, getArtistTracks);
musicRouter.get('/genres', protect, getGenres);
musicRouter.get('/recommended', protect, getRecommended);

// routes/vibey.js
const vibeyRouter = express.Router();
const { chat } = require('../controllers/vibeyController');
vibeyRouter.post('/chat', chat);

module.exports = { storyRouter, msgRouter, notifRouter, musicRouter, vibeyRouter };

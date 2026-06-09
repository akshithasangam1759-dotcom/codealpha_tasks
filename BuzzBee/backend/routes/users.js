const express = require('express');
const router = express.Router();
const { getUserProfile, followUser, searchUsers, getSuggestedUsers, addFavoriteTrack, addRecentlyPlayed, getTrendingUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/trending', protect, getTrendingUsers);
router.get('/:username', protect, getUserProfile);
router.post('/:id/follow', protect, followUser);
router.post('/me/favorites', protect, addFavoriteTrack);
router.post('/me/recently-played', protect, addRecentlyPlayed);

module.exports = router;

// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updateProfile, saveAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/avatar', protect, saveAvatar);

module.exports = router;

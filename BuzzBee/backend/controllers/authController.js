const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

// In-memory store for reset codes
const resetCodes = new Map();

// @desc    Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password, displayName, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already in use' : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password, displayName: displayName || username, role: role || 'listener' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        avatarConfig: user.avatarConfig,
        role: user.role,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        savedPosts: user.savedPosts,
        favoriteTracks: user.favoriteTracks,
        theme: user.theme,
        moodTags: user.moodTags,
        musicTaste: user.musicTaste,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: Date.now() });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, bio, role, musicTaste, moodTags, theme, chatTheme } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (role !== undefined) updates.role = role;
    if (musicTaste !== undefined) updates.musicTaste = JSON.parse(musicTaste);
    if (moodTags !== undefined) updates.moodTags = JSON.parse(moodTags);
    if (theme !== undefined) updates.theme = theme;
    if (chatTheme !== undefined) updates.chatTheme = chatTheme;

    if (req.file) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password - send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email.toLowerCase(), {
      code,
      expires: Date.now() + 15 * 60 * 1000,
      userId: user._id
    });

    // Code appears in terminal since no email service is set up yet
    console.log(`\n🔑 PASSWORD RESET CODE for ${email}: ${code}\n`);

    res.json({ success: true, message: 'Reset code sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using code
exports.resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    if (!code || !newPassword) return res.status(400).json({ success: false, message: 'Code and password required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    let found = null, foundEmail = null;
    for (const [email, data] of resetCodes.entries()) {
      if (data.code === code) { found = data; foundEmail = email; break; }
    }

    if (!found) return res.status(400).json({ success: false, message: 'Invalid reset code' });
    if (Date.now() > found.expires) {
      resetCodes.delete(foundEmail);
      return res.status(400).json({ success: false, message: 'Code expired, request a new one' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(found.userId, { password: hashed });
    resetCodes.delete(foundEmail);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save avatar config
exports.saveAvatar = async (req, res) => {
  try {
    const { avatarConfig, avatarImageUrl } = req.body;
    const updates = { avatarConfig };
    if (avatarImageUrl) updates.avatar = avatarImageUrl;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, xp, level, streak, badges) VALUES (?, ?, ?, 0, 1, 0, ?)',
      [name, email, hashed, JSON.stringify([])]
    );

    const user = { id: result.insertId, name, email, xp: 0, level: 1, streak: 0, badges: [] };
    const token = generateToken(user.id);

    // Create default workspace
    await pool.query(
      'INSERT INTO workspaces (name, description, owner_id) VALUES (?, ?, ?)',
      [`${name}'s Workspace`, 'My personal workspace', user.id]
    ).then(async ([wsResult]) => {
      await pool.query('INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
        [wsResult.insertId, user.id, 'owner']);
    }).catch(() => {});

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = user.streak || 0;
    if (user.last_active) {
      const lastActive = user.last_active.toISOString?.().split('T')[0] || user.last_active;
      if (lastActive === yesterday) streak += 1;
      else if (lastActive !== today) streak = 1;
    } else {
      streak = 1;
    }
    await pool.query('UPDATE users SET last_active = ?, streak = ? WHERE id = ?', [today, streak, user.id]);

    delete user.password;
    user.streak = streak;
    user.badges = typeof user.badges === 'string' ? JSON.parse(user.badges) : (user.badges || []);

    const token = generateToken(user.id);
    res.json({ success: true, data: { user, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = { ...req.user };
    user.badges = typeof user.badges === 'string' ? JSON.parse(user.badges) : (user.badges || []);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, bio } = req.body;
    await pool.query(
      'UPDATE users SET name = ?, avatar = ?, bio = ? WHERE id = ?',
      [name, avatar, bio, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is wrong' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, name, email, avatar, xp, level, streak, badges FROM users WHERE id = ?', [decoded.id]);

    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = auth;

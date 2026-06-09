const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { pool } = require('../config/database');

// ==================== AUTH ====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.patch('/auth/profile', auth, authController.updateProfile);
router.patch('/auth/password', auth, authController.updatePassword);

// ==================== WORKSPACES ====================
router.get('/workspaces', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.* FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ?
      WHERE w.owner_id = ? OR wm.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id, req.user.id, req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Chat history
router.get('/chat/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await pool.query(
      `SELECT m.id, m.room_id, m.content, m.created_at,
              u.id as user_id, u.name, u.avatar
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room_id = ?
       ORDER BY m.created_at DESC LIMIT ?`,
      [roomId, limit]
    );
    res.json({ success: true, data: rows.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/workspaces', auth, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const [result] = await pool.query(
      'INSERT INTO workspaces (name, description, icon, color, owner_id) VALUES (?,?,?,?,?)',
      [name, description, icon || '🏢', color, req.user.id]
    );
    await pool.query('INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?,?,?)',
      [result.insertId, req.user.id, 'owner']);
    const [rows] = await pool.query('SELECT * FROM workspaces WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PROJECTS ====================
router.get('/projects', auth, projectController.getProjects);
router.post('/projects', auth, projectController.createProject);
router.get('/projects/:id', auth, projectController.getProject);
router.patch('/projects/:id', auth, projectController.updateProject);
router.delete('/projects/:id', auth, projectController.deleteProject);
router.get('/projects/:projectId/boards', auth, projectController.getBoards);

router.post('/projects/:projectId/boards', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Board name required' });
    const [result] = await pool.query(
      'INSERT INTO boards (name, project_id) VALUES (?,?)',
      [name, req.params.projectId]
    );
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: { ...rows[0], tasks: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TASKS ====================
router.get('/tasks', auth, taskController.getTasks);
router.post('/tasks', auth, taskController.createTask);
router.get('/tasks/:id', auth, taskController.getTask);
router.patch('/tasks/:id', auth, taskController.updateTask);
router.patch('/tasks/:id/move', auth, taskController.moveTask);
router.delete('/tasks/:id', auth, taskController.deleteTask);
router.post('/tasks/:id/comments', auth, taskController.addComment);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/notifications/read-all', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TEAM ====================
router.get('/team', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.avatar, u.xp, u.level, u.streak, u.badges, u.last_active,
        pm.role,
        (SELECT COUNT(*) FROM tasks t JOIN task_assignees ta ON t.id = ta.task_id WHERE ta.user_id = u.id AND t.status = 'done') AS tasks_completed
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id IN (
        SELECT id FROM projects WHERE owner_id = ?
        UNION
        SELECT project_id FROM project_members WHERE user_id = ?
      )
    `, [req.user.id, req.user.id]);

    const members = rows.map(m => ({
      ...m,
      badges: typeof m.badges === 'string' ? JSON.parse(m.badges || '[]') : (m.badges || []),
      online: m.last_active ? new Date(m.last_active) > new Date(Date.now() - 15 * 60 * 1000) : false,
    }));

    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/team/invite', auth, async (req, res) => {
  try {
    const { email, project_id } = req.body;
    // In real app, send email invitation. For now just return success
    res.json({ success: true, message: `Invitation sent to ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[taskStats]] = await pool.query(`
      SELECT 
        COUNT(DISTINCT t.id) AS tasks_total,
        SUM(t.status = 'done') AS tasks_done
      FROM tasks t
      JOIN task_assignees ta ON t.id = ta.task_id
      WHERE ta.user_id = ?
    `, [userId]);

    const [[projectCount]] = await pool.query(`
      SELECT COUNT(DISTINCT p.id) AS projects
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
    `, [userId, userId]);

    const [[teamCount]] = await pool.query(`
      SELECT COUNT(DISTINCT pm2.user_id) AS team
      FROM project_members pm1
      JOIN project_members pm2 ON pm1.project_id = pm2.project_id AND pm2.user_id != ?
      WHERE pm1.user_id = ?
    `, [userId, userId]);

    res.json({ success: true, data: {
      tasks_total: taskStats.tasks_total || 0,
      tasks_done: taskStats.tasks_done || 0,
      projects: projectCount.projects || 0,
      team: teamCount.team || 0,
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dashboard/weekly', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const data = days.map(day => ({ day, completed: 0, created: 0 }));
    // In production, query by day of week
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ANALYTICS ====================
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status='done') AS done,
        SUM(priority='critical') AS critical,
        SUM(priority='high') AS high,
        SUM(priority='medium') AS medium,
        SUM(priority='low') AS low
      FROM tasks t
      JOIN task_assignees ta ON t.id = ta.task_id
      WHERE ta.user_id = ?
    `, [userId]);

    const productivity = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    res.json({ success: true, data: {
      productivity_score: productivity,
      tasks_completed: stats.done || 0,
      avg_completion_hours: 0,
      on_time_rate: 0,
      health_score: productivity,
      velocity_score: Math.min(productivity + 10, 100),
      risk_score: Math.max(100 - productivity, 0),
      priority_breakdown: [
        { name: 'Critical', value: stats.critical || 0 },
        { name: 'High', value: stats.high || 0 },
        { name: 'Medium', value: stats.medium || 0 },
        { name: 'Low', value: stats.low || 0 },
      ],
      weekly_data: Array.from({ length: 7 }, (_, i) => {
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        return { day: days[i], completed: 0, created: 0 };
      }),
      team_performance: [],
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

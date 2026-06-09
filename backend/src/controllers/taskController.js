const { pool } = require('../config/database');

function tryParse(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

const awardXP = async (userId, xp, badge = null) => {
  await pool.query('UPDATE users SET xp = xp + ?, level = FLOOR((xp + ?) / 1000) + 1 WHERE id = ?', [xp, xp, userId]);
  if (badge) {
    const [rows] = await pool.query('SELECT badges FROM users WHERE id = ?', [userId]);
    const badges = tryParse(rows[0]?.badges, []);
    if (!badges.find(b => b.id === badge.id)) {
      badges.push({ ...badge, earned_at: new Date().toISOString() });
      await pool.query('UPDATE users SET badges = ? WHERE id = ?', [JSON.stringify(badges), userId]);
    }
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { assignee, project_id, board_id, status, priority, limit = 100 } = req.query;
    const userId = req.user.id;

    let where = '1=1';
    const params = [];

    if (assignee === 'me') {
      where += ' AND ta.user_id = ?';
      params.push(userId);
    }
    if (project_id) { where += ' AND t.project_id = ?'; params.push(project_id); }
    if (board_id) { where += ' AND t.board_id = ?'; params.push(board_id); }
    if (status) { where += ' AND t.status = ?'; params.push(status); }
    if (priority) { where += ' AND t.priority = ?'; params.push(priority); }
    params.push(parseInt(limit));

    const [tasks] = await pool.query(`
      SELECT t.*,
        GROUP_CONCAT(DISTINCT CONCAT(u.id,'|',u.name,'|',COALESCE(u.avatar,'')) ORDER BY u.id SEPARATOR ';;') AS assignees_raw
      FROM tasks t
      LEFT JOIN task_assignees ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE ${where}
      GROUP BY t.id
      ORDER BY t.due_date ASC, t.\`order\` ASC
      LIMIT ?
    `, params);

    const result = tasks.map(task => ({
      ...task,
      tags: tryParse(task.tags, []),
      labels: tryParse(task.labels, []),
      checklist: tryParse(task.checklist, []),
      dependencies: tryParse(task.dependencies, []),
      assignees: task.assignees_raw
        ? task.assignees_raw.split(';;').filter(Boolean).map(a => {
            const [id, name, avatar] = a.split('|');
            return { id: parseInt(id), name, avatar: avatar || null };
          })
        : [],
    }));

    // Remove raw field
    result.forEach(t => delete t.assignees_raw);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT t.*, u.name AS creator_name FROM tasks t JOIN users u ON t.created_by = u.id WHERE t.id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Task not found' });

    const task = rows[0];
    task.tags = tryParse(task.tags, []);
    task.labels = tryParse(task.labels, []);
    task.checklist = tryParse(task.checklist, []);
    task.dependencies = tryParse(task.dependencies, []);

    const [assignees] = await pool.query('SELECT u.id, u.name, u.email, u.avatar FROM task_assignees ta JOIN users u ON ta.user_id = u.id WHERE ta.task_id = ?', [id]);
    task.assignees = assignees;

    const [comments] = await pool.query(`
      SELECT c.*, u.name AS user_name, u.avatar AS user_avatar
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ? ORDER BY c.created_at ASC
    `, [id]);
    task.comments = comments.map(c => ({ ...c, reactions: tryParse(c.reactions, {}) }));

    const [subtasks] = await pool.query('SELECT * FROM subtasks WHERE task_id = ?', [id]);
    task.subtasks = subtasks;

    const [attachments] = await pool.query('SELECT a.*, u.name AS uploader_name FROM attachments a JOIN users u ON a.uploaded_by = u.id WHERE a.task_id = ?', [id]);
    task.attachments = attachments;

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, board_id, project_id, priority, status, due_date, estimated_hours, tags, labels, assignees } = req.body;
    const userId = req.user.id;

    if (!title || !board_id || !project_id) return res.status(400).json({ success: false, message: 'Title, board_id and project_id required' });

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, board_id, project_id, priority, status, due_date, estimated_hours, tags, labels, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [title, description, board_id, project_id, priority || 'medium', status || 'todo', due_date || null, estimated_hours || null, JSON.stringify(tags || []), JSON.stringify(labels || []), userId]
    );

    const taskId = result.insertId;

    if (assignees && assignees.length > 0) {
      for (const uid of assignees) {
        await pool.query('INSERT IGNORE INTO task_assignees (task_id, user_id) VALUES (?, ?)', [taskId, uid]);
      }
    }

    // Log activity
    await pool.query('INSERT INTO activity_log (project_id, task_id, user_id, action, details) VALUES (?,?,?,?,?)',
      [project_id, taskId, userId, 'task_created', JSON.stringify({ title })]);

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    const task = rows[0];
    task.tags = tryParse(task.tags, []);
    task.labels = tryParse(task.labels, []);
    task.checklist = tryParse(task.checklist, []);
    task.assignees = [];

    // XP for creating task
    await awardXP(userId, 10);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, progress, checklist, tags, labels } = req.body;

    // Check if completing
    const [before] = await pool.query('SELECT status, project_id FROM tasks WHERE id = ?', [id]);
    const wasNotDone = before[0]?.status !== 'done';
    const isNowDone = status === 'done';

    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title=?'); params.push(title); }
    if (description !== undefined) { updates.push('description=?'); params.push(description); }
    if (priority !== undefined) { updates.push('priority=?'); params.push(priority); }
    if (status !== undefined) { updates.push('status=?'); params.push(status); }
    if (due_date !== undefined) { updates.push('due_date=?'); params.push(due_date); }
    if (progress !== undefined) { updates.push('progress=?'); params.push(progress); }
    if (checklist !== undefined) { updates.push('checklist=?'); params.push(JSON.stringify(checklist)); }
    if (tags !== undefined) { updates.push('tags=?'); params.push(JSON.stringify(tags)); }
    if (labels !== undefined) { updates.push('labels=?'); params.push(JSON.stringify(labels)); }

    if (updates.length === 0) return res.json({ success: true, message: 'Nothing to update' });

    params.push(id);
    await pool.query(`UPDATE tasks SET ${updates.join(',')} WHERE id=?`, params);

    // XP for completing task
    if (wasNotDone && isNowDone) {
      await awardXP(req.user.id, 50);
      // Update project progress
      if (before[0]?.project_id) {
        const [taskStats] = await pool.query(
          'SELECT COUNT(*) as total, SUM(status="done") as done FROM tasks WHERE project_id=?',
          [before[0].project_id]
        );
        const progress = taskStats[0].total > 0 ? Math.round((taskStats[0].done / taskStats[0].total) * 100) : 0;
        await pool.query('UPDATE projects SET progress=? WHERE id=?', [progress, before[0].project_id]);
      }
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    const task = rows[0];
    task.tags = tryParse(task.tags, []);
    task.labels = tryParse(task.labels, []);
    task.checklist = tryParse(task.checklist, []);

    res.json({ success: true, data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { board_id, order } = req.body;
    await pool.query('UPDATE tasks SET board_id=COALESCE(?,board_id), `order`=COALESCE(?,`order`) WHERE id=?', [board_id, order, id]);
    res.json({ success: true, message: 'Task moved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ success: false, message: 'Comment content required' });

    const [result] = await pool.query('INSERT INTO comments (content, task_id, user_id) VALUES (?,?,?)', [content, id, userId]);
    const [rows] = await pool.query(`
      SELECT c.*, u.name AS user_name, u.avatar AS user_avatar
      FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
    `, [result.insertId]);

    const comment = { ...rows[0], reactions: {} };
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

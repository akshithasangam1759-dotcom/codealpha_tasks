const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_BOARDS = {
  'Website Development':    ['Design', 'Frontend', 'Backend', 'Testing', 'Deployment'],
  'Portfolio Website':      ['Planning', 'Design', 'Development', 'Content'],
  'E-Commerce Website':     ['UI/UX', 'Frontend', 'Backend', 'Payment', 'Testing'],
  'Mobile Application':     ['Design', 'Development', 'Testing', 'Store Submission'],
  'College Project':        ['Research', 'Development', 'Documentation', 'Presentation'],
  'School Project':         ['Planning', 'Tasks', 'Review', 'Submit'],
  'AI / ML Project':        ['Data Collection', 'Model Training', 'Evaluation', 'Deployment'],
  'UI / UX Design Project': ['Research', 'Wireframes', 'Mockups', 'Prototype', 'Handoff'],
  'Startup Launch':         ['MVP', 'Marketing', 'Legal', 'Launch'],
  'Marketing Campaign':     ['Strategy', 'Content', 'Design', 'Analytics'],
  'Research Project':       ['Literature Review', 'Data Collection', 'Analysis', 'Report'],
  'Content Creation Project': ['Ideas', 'Writing', 'Editing', 'Publishing'],
  'Custom Project':         ['To Do', 'In Progress', 'Review', 'Done'],
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;

    const [projects] = await pool.query(`
      SELECT p.*, 
        u.name AS owner_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') AS done_count
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = ? OR pm.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [userId, userId, userId, limit]);

    // Get members for each project
    for (const project of projects) {
      const [members] = await pool.query(`
        SELECT pm.role, u.id, u.name, u.email, u.avatar, u.xp, u.level
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
      `, [project.id]);
      project.members = members;
      project.progress = project.task_count > 0 ? Math.round((project.done_count / project.task_count) * 100) : 0;
    }

    res.json({ success: true, data: projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, u.name AS owner_name
      FROM projects p JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Project not found' });

    const project = rows[0];
    const [members] = await pool.query(`
      SELECT pm.role, u.id, u.name, u.email, u.avatar, u.xp, u.level
      FROM project_members pm JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [id]);
    project.members = members;

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, template, color, icon, due_date, workspace_id, boards, team_emails, team_roles, initial_tasks } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ success: false, message: 'Project name required' });

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, template, color, icon, due_date, workspace_id, owner_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, template || 'Custom Project', color, icon, due_date || null, workspace_id || null, userId, 'active']
    );
    const projectId = result.insertId;

    // Add owner as member
    await pool.query('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [projectId, userId, 'Team Leader']);

    // Create boards from template
    const boardNames = boards || DEFAULT_BOARDS[template] || DEFAULT_BOARDS['Custom Project'];
    const boardIds = [];
    for (let i = 0; i < boardNames.length; i++) {
      const [bResult] = await pool.query(
        'INSERT INTO boards (name, project_id, `order`) VALUES (?, ?, ?)',
        [boardNames[i], projectId, i]
      );
      boardIds.push(bResult.insertId);
    }

    // Create initial tasks from Nesty if provided
    if (initial_tasks && initial_tasks.length > 0 && boardIds.length > 0) {
      for (let i = 0; i < initial_tasks.length; i++) {
        const boardIdx = Math.floor(i / Math.ceil(initial_tasks.length / boardIds.length));
        const boardId = boardIds[Math.min(boardIdx, boardIds.length - 1)];
        await pool.query(
          'INSERT INTO tasks (title, board_id, project_id, priority, status, created_by, `order`) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [initial_tasks[i], boardId, projectId, 'medium', 'todo', userId, i]
        );
      }
    }

    // Invite team members
    if (team_emails && team_emails.length > 0) {
      for (const email of team_emails) {
        const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length) {
          const role = team_roles?.[email] || 'Team Member';
          await pool.query(
            'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [projectId, userRows[0].id, role]
          );
        }
      }
    }

    const [project] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    res.status(201).json({ success: true, data: project[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, color, due_date, progress } = req.body;

    await pool.query(
      'UPDATE projects SET name=COALESCE(?,name), description=COALESCE(?,description), status=COALESCE(?,status), color=COALESCE(?,color), due_date=COALESCE(?,due_date), progress=COALESCE(?,progress) WHERE id=?',
      [name, description, status, color, due_date, progress, id]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ? AND owner_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const { projectId } = req.params;
    const [boards] = await pool.query(
      'SELECT * FROM boards WHERE project_id = ? ORDER BY `order` ASC',
      [projectId]
    );

    for (const board of boards) {
      const [tasks] = await pool.query(`
        SELECT t.*, 
          GROUP_CONCAT(DISTINCT CONCAT(u.id, '|', u.name, '|', COALESCE(u.avatar,'')) ORDER BY u.id SEPARATOR ';;') AS assignees_raw
        FROM tasks t
        LEFT JOIN task_assignees ta ON t.id = ta.task_id
        LEFT JOIN users u ON ta.user_id = u.id
        WHERE t.board_id = ?
        GROUP BY t.id
        ORDER BY t.\`order\` ASC
      `, [board.id]);

      board.tasks = tasks.map(task => {
        task.tags = tryParse(task.tags, []);
        task.labels = tryParse(task.labels, []);
        task.checklist = tryParse(task.checklist, []);
        task.assignees = task.assignees_raw
          ? task.assignees_raw.split(';;').filter(Boolean).map(a => {
              const [id, name, avatar] = a.split('|');
              return { id: parseInt(id), name, avatar: avatar || null };
            })
          : [];
        delete task.assignees_raw;
        return task;
      });
    }

    res.json({ success: true, data: boards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

function tryParse(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

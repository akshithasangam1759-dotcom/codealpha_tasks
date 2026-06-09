-- WorkNest Database Schema
-- Run this file to set up your MySQL database
-- mysql -u root -p worknest < schema.sql

CREATE DATABASE IF NOT EXISTS worknest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE worknest;

-- ===================== USERS =====================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_active DATE,
  badges JSON DEFAULT ('[]'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================== WORKSPACES =====================
CREATE TABLE IF NOT EXISTS workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🏢',
  color VARCHAR(100) DEFAULT 'linear-gradient(135deg, #7c3aed, #ec4899)',
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (workspace_id, user_id)
);

-- ===================== PROJECTS =====================
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template VARCHAR(100) DEFAULT 'Custom Project',
  workspace_id INT,
  owner_id INT NOT NULL,
  color VARCHAR(200) DEFAULT 'linear-gradient(135deg, #7c3aed, #ec4899)',
  icon VARCHAR(10),
  status ENUM('active', 'completed', 'on-hold', 'archived') DEFAULT 'active',
  progress INT DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(100) DEFAULT 'Team Member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_member (project_id, user_id)
);

-- ===================== BOARDS =====================
CREATE TABLE IF NOT EXISTS boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  project_id INT NOT NULL,
  color VARCHAR(50),
  `order` INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ===================== TASKS =====================
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  board_id INT NOT NULL,
  project_id INT NOT NULL,
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  status ENUM('todo', 'in-progress', 'review', 'done') DEFAULT 'todo',
  due_date DATETIME,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  tags JSON DEFAULT ('[]'),
  labels JSON DEFAULT ('[]'),
  checklist JSON DEFAULT ('[]'),
  dependencies JSON DEFAULT ('[]'),
  progress INT DEFAULT 0,
  `order` INT DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_assignees (
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  task_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  size INT,
  type VARCHAR(100),
  task_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================== COMMENTS =====================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  reactions JSON DEFAULT ('{}'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================== NOTIFICATIONS =====================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================== INVITATIONS =====================
CREATE TABLE IF NOT EXISTS invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  project_id INT,
  workspace_id INT,
  role VARCHAR(100) DEFAULT 'Team Member',
  token VARCHAR(255) NOT NULL UNIQUE,
  invited_by INT NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================== ACTIVITY LOG =====================
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  task_id INT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================== INDEXES =====================
CREATE INDEX idx_tasks_board ON tasks(board_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_activity_project ON activity_log(project_id);

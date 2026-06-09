// ==================== USER TYPES ====================
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
  created_at: string;
  bio?: string;
}

// ==================== AUTH TYPES ====================
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// ==================== WORKSPACE TYPES ====================
export interface Workspace {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  owner_id: number;
  members: WorkspaceMember[];
  projects: Project[];
  created_at: string;
}

export interface WorkspaceMember {
  user_id: number;
  workspace_id: number;
  role: 'owner' | 'admin' | 'member';
  user: User;
}

// ==================== PROJECT TYPES ====================
export type ProjectTemplate =
  | 'Website Development'
  | 'Portfolio Website'
  | 'E-Commerce Website'
  | 'Mobile Application'
  | 'College Project'
  | 'School Project'
  | 'AI / ML Project'
  | 'UI / UX Design Project'
  | 'Startup Launch'
  | 'Marketing Campaign'
  | 'Research Project'
  | 'Content Creation Project'
  | 'Custom Project';

export type TeamRole =
  | 'Team Leader'
  | 'Project Manager'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'UI/UX Designer'
  | 'QA Tester'
  | 'Research Analyst'
  | 'Documentation Lead'
  | 'Presentation Lead'
  | 'Content Writer'
  | 'Marketing Lead'
  | 'Team Member';

export interface Project {
  id: number;
  name: string;
  description?: string;
  template: ProjectTemplate;
  workspace_id: number;
  owner_id: number;
  color: string;
  icon?: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  progress: number;
  due_date?: string;
  members: ProjectMember[];
  boards: Board[];
  created_at: string;
}

export interface ProjectMember {
  user_id: number;
  project_id: number;
  role: TeamRole;
  user: User;
}

// ==================== BOARD TYPES ====================
export interface Board {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  color?: string;
  order: number;
  tasks: Task[];
  created_at: string;
}

// ==================== TASK TYPES ====================
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  board_id: number;
  project_id: number;
  assignees: User[];
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  labels: string[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  subtasks: Subtask[];
  dependencies: number[];
  order: number;
  progress: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  task_id: number;
}

export interface Attachment {
  id: number;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploaded_by: number;
  created_at: string;
}

// ==================== COMMENT TYPES ====================
export interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  user: User;
  reactions: Reaction[];
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  emoji: string;
  users: number[];
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: number;
  user_id: number;
  type: 'task_assigned' | 'comment' | 'mention' | 'due_date' | 'project_update' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

// ==================== GAMIFICATION TYPES ====================
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  unlocked: boolean;
}

// ==================== ANALYTICS TYPES ====================
export interface Analytics {
  productivity_score: number;
  tasks_completed: number;
  tasks_pending: number;
  on_time_rate: number;
  weekly_data: WeeklyData[];
  team_performance: TeamPerformance[];
}

export interface WeeklyData {
  day: string;
  completed: number;
  created: number;
}

export interface TeamPerformance {
  user: User;
  tasks_completed: number;
  productivity_score: number;
  xp_earned: number;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== SOCKET EVENTS ====================
export interface SocketEvents {
  'task:created': Task;
  'task:updated': Task;
  'task:deleted': { id: number };
  'comment:created': Comment;
  'board:updated': Board;
  'user:online': { user_id: number };
  'user:offline': { user_id: number };
  'notification:new': Notification;
}


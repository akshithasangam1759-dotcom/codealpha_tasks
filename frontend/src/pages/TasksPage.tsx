import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiCalendar, FiFlag, FiCheck, FiClock, FiList, FiGrid } from 'react-icons/fi';
import api from '../utils/api';
import type { Task } from '../types';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e'
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due_date');

  useEffect(() => {
    api.get('/tasks?assignee=me')
      .then(r => setTasks(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      if (newStatus === 'done') toast.success('Task completed! +50 XP 🎉');
    } catch { toast.error('Failed to update task'); }
  };

  const filtered = tasks
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const grouped = {
    overdue: filtered.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'done'),
    today: filtered.filter(t => t.due_date && isToday(new Date(t.due_date)) && t.status !== 'done'),
    upcoming: filtered.filter(t => (!t.due_date || (!isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)))) && t.status !== 'done'),
    done: filtered.filter(t => t.status === 'done'),
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all group cursor-pointer"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => handleToggle(task)}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            task.status === 'done'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-400 hover:border-purple-400'
          }`}
        >
          {task.status === 'done' && <FiCheck size={10} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through opacity-50' : ''}`}
            style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs" style={{ color: 'var(--accent)' }}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs" style={{ color: PRIORITY_COLORS[task.priority] }}>
            <FiFlag size={12} />
            <span className="hidden sm:block capitalize">{task.priority}</span>
          </div>
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : ''}`}
              style={{ color: overdue ? '#ef4444' : 'var(--text-secondary)' }}>
              <FiCalendar size={12} />
              {format(new Date(task.due_date), 'MMM d')}
            </div>
          )}
          <span className={`badge text-xs px-2 py-0.5 rounded-lg status-${task.status.replace('-', '')}`}>
            {task.status}
          </span>
        </div>
      </motion.div>
    );
  };

  const GroupSection = ({ title, tasks, color }: { title: string; tasks: Task[]; color: string }) => {
    if (tasks.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <span className="badge px-2 py-0.5 text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {tasks.length}
          </span>
        </div>
        <div className="card overflow-hidden">
          {tasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            My Tasks
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {tasks.filter(t => t.status !== 'done').length} pending • {tasks.filter(t => t.status === 'done').length} done
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-secondary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="input-field pl-9 py-2 text-sm w-full" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="due_date">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="created">Sort: Newest</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-6xl">✅</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No tasks match your search' : 'No tasks yet!'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Try different keywords' : 'Tasks assigned to you will show up here'}
          </p>
        </div>
      ) : (
        <>
          <GroupSection title="⚠️ Overdue" tasks={grouped.overdue} color="#ef4444" />
          <GroupSection title="📅 Due Today" tasks={grouped.today} color="#f59e0b" />
          <GroupSection title="📋 Upcoming" tasks={grouped.upcoming} color="#7c3aed" />
          <GroupSection title="✅ Completed" tasks={grouped.done} color="#10b981" />
        </>
      )}
    </div>
  );
}

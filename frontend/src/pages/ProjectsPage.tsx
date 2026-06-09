import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiGrid, FiList, FiSearch, FiCalendar, FiUsers, FiMoreHorizontal } from 'react-icons/fi';
import api from '../utils/api';
import type { Project } from '../types';
import { format } from 'date-fns';
import CreateProjectModal from '../components/modals/CreateProjectModal';

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  completed: '#7c3aed',
  'on-hold': '#f59e0b',
  archived: '#6b7280',
};

const TEMPLATE_EMOJIS: Record<string, string> = {
  'Website Development': '🌐',
  'Portfolio Website': '🎨',
  'E-Commerce Website': '🛍️',
  'Mobile Application': '📱',
  'College Project': '🎓',
  'School Project': '📚',
  'AI / ML Project': '🤖',
  'UI / UX Design Project': '✏️',
  'Startup Launch': '🚀',
  'Marketing Campaign': '📢',
  'Research Project': '🔬',
  'Content Creation Project': '📝',
  'Custom Project': '⚙️',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.template?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-secondary)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="input-field pl-9 py-2 text-sm w-48"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="p-2.5 transition-all"
                style={{ background: view === v ? 'var(--accent)' : 'var(--bg-secondary)', color: view === v ? 'white' : 'var(--text-secondary)' }}>
                {v === 'grid' ? <FiGrid size={16} /> : <FiList size={16} />}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-6 h-48 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="text-6xl">🗂️</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No projects found' : 'No projects yet!'}
          </h3>
          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            {search
              ? `No projects match "${search}". Try a different search.`
              : 'Create your first project and let Nesty AI help you plan everything from scratch. 🤖'}
          </p>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} /> Create Your First Project
            </button>
          )}
        </motion.div>
      ) : (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/projects/${project.id}`}>
                <div className="card p-6 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: project.color || 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                      {TEMPLATE_EMOJIS[project.template] || project.icon || '📋'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge text-xs px-2 py-1 rounded-lg"
                        style={{ background: `${STATUS_COLORS[project.status]}20`, color: STATUS_COLORS[project.status] }}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold mb-1 group-hover:text-purple-400 transition-colors"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                    {project.name}
                  </h3>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {project.description || project.template}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${project.progress || 0}%`, background: project.color || 'var(--accent)' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {(project.members || []).slice(0, 3).map((m: any, idx: number) => (
                          <div key={idx} className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold"
                            style={{ background: 'var(--accent)', borderColor: 'var(--bg-secondary)' }}>
                            {m.user?.name?.[0] || 'U'}
                          </div>
                        ))}
                      </div>
                      {(project.members?.length || 0) > 3 && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          +{(project.members?.length || 0) - 3}
                        </span>
                      )}
                      {(!project.members || project.members.length === 0) && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>No members yet</span>
                      )}
                    </div>
                    {project.due_date && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <FiCalendar size={12} />
                        {format(new Date(project.due_date), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}

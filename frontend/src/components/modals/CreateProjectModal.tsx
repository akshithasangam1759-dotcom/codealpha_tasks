import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiArrowLeft, FiZap, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import type { Project, ProjectTemplate, TeamRole } from '../../types';
import toast from 'react-hot-toast';

const TEMPLATES: { name: ProjectTemplate; emoji: string; desc: string; boards: string[] }[] = [
  { name: 'Website Development', emoji: '🌐', desc: 'Full-stack web development workflow', boards: ['Design', 'Frontend', 'Backend', 'Testing', 'Deployment'] },
  { name: 'Portfolio Website', emoji: '🎨', desc: 'Showcase your work beautifully', boards: ['Planning', 'Design', 'Development', 'Content'] },
  { name: 'E-Commerce Website', emoji: '🛍️', desc: 'Online store from scratch', boards: ['UI/UX', 'Frontend', 'Backend', 'Payment', 'Testing'] },
  { name: 'Mobile Application', emoji: '📱', desc: 'iOS/Android app development', boards: ['Design', 'Development', 'Testing', 'Store Submission'] },
  { name: 'College Project', emoji: '🎓', desc: 'Academic project management', boards: ['Research', 'Development', 'Documentation', 'Presentation'] },
  { name: 'School Project', emoji: '📚', desc: 'School assignment tracker', boards: ['Planning', 'Tasks', 'Review', 'Submit'] },
  { name: 'AI / ML Project', emoji: '🤖', desc: 'Machine learning pipeline', boards: ['Data Collection', 'Model Training', 'Evaluation', 'Deployment'] },
  { name: 'UI / UX Design Project', emoji: '✏️', desc: 'Design system & prototyping', boards: ['Research', 'Wireframes', 'Mockups', 'Prototype', 'Handoff'] },
  { name: 'Startup Launch', emoji: '🚀', desc: 'Launch your startup fast', boards: ['MVP', 'Marketing', 'Legal', 'Launch'] },
  { name: 'Marketing Campaign', emoji: '📢', desc: 'Campaign planning & execution', boards: ['Strategy', 'Content', 'Design', 'Analytics'] },
  { name: 'Research Project', emoji: '🔬', desc: 'Academic or market research', boards: ['Literature Review', 'Data Collection', 'Analysis', 'Report'] },
  { name: 'Content Creation Project', emoji: '📝', desc: 'Blog, video & social content', boards: ['Ideas', 'Writing', 'Editing', 'Publishing'] },
  { name: 'Custom Project', emoji: '⚙️', desc: 'Start from scratch your way', boards: ['To Do', 'In Progress', 'Review', 'Done'] },
];

const ROLES: TeamRole[] = [
  'Team Leader', 'Project Manager', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'UI/UX Designer', 'QA Tester', 'Research Analyst',
  'Documentation Lead', 'Presentation Lead', 'Content Writer', 'Marketing Lead', 'Team Member'
];

const PROJECT_COLORS = [
  'linear-gradient(135deg, #7c3aed, #ec4899)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #0ea5e9)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f59e0b)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
];

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
  workspaceId?: number;
}

export default function CreateProjectModal({ onClose, onCreated, workspaceId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nestyLoading, setNestyLoading] = useState(false);
  const [nestyTaskSuggestions, setNestyTaskSuggestions] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    template: '' as ProjectTemplate | '',
    color: PROJECT_COLORS[0],
    due_date: '',
    workspace_id: workspaceId,
    teamEmails: [] as string[],
    teamRoles: {} as Record<string, TeamRole>,
  });
  const [emailInput, setEmailInput] = useState('');

  const selectedTemplate = TEMPLATES.find(t => t.name === form.template);

  const askNesty = async () => {
    if (!form.name || !form.template) return;
    setNestyLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `I'm creating a ${form.template} project called "${form.name}". ${form.description ? `Description: ${form.description}` : ''}
            
List exactly 10 specific tasks I should start with. Return ONLY a JSON array of strings, no explanation, no markdown. Example: ["Task 1", "Task 2"]`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '[]';
      const clean = text.replace(/```json|```/g, '').trim();
      const tasks = JSON.parse(clean);
      setNestyTaskSuggestions(Array.isArray(tasks) ? tasks : []);
    } catch {
      toast.error('Nesty had a hiccup! Try again 🤖');
    } finally {
      setNestyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.template) return toast.error('Fill in all required fields!');
    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name: form.name,
        description: form.description,
        template: form.template,
        color: form.color,
        due_date: form.due_date || null,
        workspace_id: form.workspace_id,
        boards: selectedTemplate?.boards || [],
        team_emails: form.teamEmails,
        team_roles: form.teamRoles,
        initial_tasks: nestyTaskSuggestions,
      });
      onCreated(res.data.data);
      toast.success('Project created! 🚀');
    } catch {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && !form.teamEmails.includes(email)) {
      setForm(p => ({ ...p, teamEmails: [...p.teamEmails, email] }));
      setEmailInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              {step === 1 ? '🎨 Pick a Template' : step === 2 ? '⚙️ Project Details' : '👥 Build Your Team'}
            </h2>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="h-1.5 w-12 rounded-full transition-all"
                  style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
            <FiX size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Template */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => setForm(p => ({ ...p, template: t.name }))}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    form.template === t.name
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-[var(--border)] hover:border-purple-400/50 hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Project Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={`e.g. My ${form.template || 'Project'}`}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What's this project about?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Project Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {PROJECT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(p => ({ ...p, color }))}
                      className="w-8 h-8 rounded-lg transition-all"
                      style={{
                        background: color,
                        outline: form.color === color ? '3px solid var(--accent)' : 'none',
                        outlineOffset: '2px'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Boards preview */}
              {selectedTemplate && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Boards that will be created
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.boards.map(b => (
                      <span key={b} className="badge px-3 py-1 text-xs rounded-lg"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nesty AI Tasks */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Let Nesty generate starter tasks</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  AI will suggest 10 tasks based on your project name and template
                </p>
                <button
                  onClick={askNesty}
                  disabled={nestyLoading || !form.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                >
                  {nestyLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : <FiZap size={14} />}
                  {nestyLoading ? 'Generating...' : 'Generate with Nesty'}
                </button>
                {nestyTaskSuggestions.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {nestyTaskSuggestions.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <FiCheck size={12} className="text-green-400 flex-shrink-0" />
                        <span style={{ color: 'var(--text-primary)' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Invite team members by email. They'll receive an invitation to join the project.
              </p>
              <div className="flex gap-2">
                <input
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEmail()}
                  placeholder="teammate@email.com"
                  className="input-field flex-1"
                />
                <button onClick={addEmail} className="btn-primary px-4 py-2">Add</button>
              </div>
              {form.teamEmails.length > 0 && (
                <div className="flex flex-col gap-3">
                  {form.teamEmails.map(email => (
                    <div key={email} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: 'var(--accent)' }}>
                        {email[0].toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{email}</span>
                      <select
                        value={form.teamRoles[email] || 'Team Member'}
                        onChange={e => setForm(p => ({ ...p, teamRoles: { ...p.teamRoles, [email]: e.target.value as TeamRole } }))}
                        className="input-field text-xs py-1 px-2 w-40"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button onClick={() => setForm(p => ({ ...p, teamEmails: p.teamEmails.filter(e => e !== email) }))}
                        className="text-red-400 hover:text-red-300 transition-colors">
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.teamEmails.length === 0 && (
                <div className="flex flex-col items-center py-6 gap-2">
                  <div className="text-3xl">👥</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    You can skip this and invite team members later
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 flex justify-between"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="btn-ghost flex items-center gap-2"
          >
            <FiArrowLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !form.template}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Next <FiArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !form.name}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🚀'}
              Create Project
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiZap, FiAward, FiMail, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<string, string> = {
  'Team Leader': '#f59e0b',
  'Project Manager': '#7c3aed',
  'Frontend Developer': '#0ea5e9',
  'Backend Developer': '#10b981',
  'Full Stack Developer': '#6366f1',
  'UI/UX Designer': '#ec4899',
  'QA Tester': '#ef4444',
  'Research Analyst': '#f97316',
  'Team Member': '#6b7280',
};

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    api.get('/team').then(r => setMembers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await api.post('/team/invite', { email: inviteEmail });
      toast.success(`Invite sent to ${inviteEmail}! 🎉`);
      setInviteEmail('');
      setShowInvite(false);
    } catch { toast.error('Failed to send invite'); }
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Team</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-secondary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="input-field pl-9 py-2 text-sm w-48" />
          </div>
          <button onClick={() => setShowInvite(s => !s)} className="btn-primary flex items-center gap-2">
            <FiUserPlus size={16} /> Invite
          </button>
        </div>
      </div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 mb-6 flex items-center gap-3">
          <FiMail size={18} style={{ color: 'var(--text-secondary)' }} />
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="Enter email address..." className="input-field flex-1 py-2" />
          <button onClick={handleInvite} className="btn-primary py-2 px-4">Send Invite</button>
          <button onClick={() => setShowInvite(false)} className="btn-ghost py-2 px-4">Cancel</button>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-6xl">👥</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No members found' : 'No team members yet!'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Try a different search' : 'Invite your teammates to collaborate 🚀'}
          </p>
          {!search && (
            <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
              <FiUserPlus size={16} /> Invite Team Members
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                    {member.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    style={{ background: member.online ? '#10b981' : '#6b7280', borderColor: 'var(--bg-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</h3>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{member.email}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${ROLE_COLORS[member.role] || '#6b7280'}20`, color: ROLE_COLORS[member.role] || '#6b7280' }}>
                    {member.role || 'Team Member'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Tasks', value: member.tasks_completed || 0 },
                  { label: 'Level', value: Math.floor((member.xp || 0) / 1000) + 1 },
                  { label: 'Streak', value: `${member.streak || 0}🔥` },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><FiZap size={10} style={{ color: '#f59e0b' }} /> {member.xp || 0} XP</span>
                <span>{1000 - ((member.xp || 0) % 1000)} to next level</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${((member.xp || 0) % 1000) / 10}%` }} />
              </div>

              {member.badges && member.badges.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {member.badges.slice(0, 4).map((badge: any) => (
                    <span key={badge.id} title={badge.name} className="text-lg">{badge.icon}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

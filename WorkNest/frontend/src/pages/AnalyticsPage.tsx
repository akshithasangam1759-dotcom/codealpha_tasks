import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiAward, FiZap, FiTarget, FiClock } from 'react-icons/fi';
import api from '../utils/api';

const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').catch(() => ({ data: { data: {} } }))
      .then(r => setAnalytics(r.data?.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = analytics.weekly_data || [
    { day: 'Mon', completed: 0, created: 0, hours: 0 },
    { day: 'Tue', completed: 0, created: 0, hours: 0 },
    { day: 'Wed', completed: 0, created: 0, hours: 0 },
    { day: 'Thu', completed: 0, created: 0, hours: 0 },
    { day: 'Fri', completed: 0, created: 0, hours: 0 },
    { day: 'Sat', completed: 0, created: 0, hours: 0 },
    { day: 'Sun', completed: 0, created: 0, hours: 0 },
  ];

  const priorityData = analytics.priority_breakdown || [
    { name: 'Critical', value: 0 },
    { name: 'High', value: 0 },
    { name: 'Medium', value: 0 },
    { name: 'Low', value: 0 },
  ];

  const teamData = analytics.team_performance || [];

  const radarData = [
    { metric: 'Speed', value: analytics.speed_score || 0 },
    { metric: 'Quality', value: analytics.quality_score || 0 },
    { metric: 'Consistency', value: analytics.consistency_score || 0 },
    { metric: 'Collaboration', value: analytics.collab_score || 0 },
    { metric: 'On-Time', value: analytics.ontime_score || 0 },
  ];

  const statCards = [
    { icon: FiTarget, label: 'Productivity Score', value: `${analytics.productivity_score || 0}%`, trend: '+5%', up: true, color: '#7c3aed' },
    { icon: FiZap, label: 'Tasks Completed', value: analytics.tasks_completed || 0, trend: '+12', up: true, color: '#f59e0b' },
    { icon: FiClock, label: 'Avg. Completion Time', value: `${analytics.avg_completion_hours || 0}h`, trend: '-2h', up: true, color: '#10b981' },
    { icon: FiAward, label: 'On-Time Rate', value: `${analytics.on_time_rate || 0}%`, trend: '+3%', up: true, color: '#ec4899' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 rounded-xl shadow-xl text-sm"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
          Analytics 📊
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Track your productivity and team performance
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} custom={i} initial="hidden" animate="show" variants={fadeUp} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}20` }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                {card.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp} className="card p-6 lg:col-span-2">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Weekly Activity
          </h3>
          {weeklyData.some((d: any) => d.completed > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Completed" />
                <Bar dataKey="created" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Created" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-3">
              <div className="text-4xl">📈</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Complete tasks to see your activity data
              </p>
            </div>
          )}
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="show" variants={fadeUp} className="card p-6">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Performance Radar
          </h3>
          {radarData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Radar name="Score" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2">
              <div className="text-3xl">🎯</div>
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                Complete more tasks to unlock your radar
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Priority Breakdown + Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div custom={6} initial="hidden" animate="show" variants={fadeUp} className="card p-6">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Task Priority Breakdown
          </h3>
          {priorityData.some((d: any) => d.value > 0) ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                    {priorityData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {priorityData.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span className="font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <div className="text-3xl">🥧</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No task data yet</p>
            </div>
          )}
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="show" variants={fadeUp} className="card p-6">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Team Performance
          </h3>
          {teamData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <div className="text-3xl">👥</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add team members to see their performance</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {teamData.map((member: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}>
                    {member.user?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{member.user?.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{member.tasks_completed} tasks</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${member.productivity_score || 0}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: '#f59e0b' }}>
                    <FiZap size={10} />
                    {member.xp_earned || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Productivity Health Meter */}
      <motion.div custom={8} initial="hidden" animate="show" variants={fadeUp} className="card p-6">
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
          Project Health Meter 🏥
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Overall Health', value: analytics.health_score || 0, color: '#10b981', icon: '💚' },
            { label: 'Velocity', value: analytics.velocity_score || 0, color: '#7c3aed', icon: '⚡' },
            { label: 'Risk Level', value: 100 - (analytics.risk_score || 0), color: '#f59e0b', icon: '🛡️' },
          ].map(meter => (
            <div key={meter.label} className="flex flex-col items-center gap-3">
              <div className="text-3xl">{meter.icon}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{meter.label}</div>
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={meter.color} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - meter.value / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{meter.value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

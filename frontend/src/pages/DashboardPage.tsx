import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiCheckSquare, FiClock, FiZap, FiAward, FiUsers, FiPlus, FiArrowRight, FiTarget } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const fadeUp = {
  hidden: { opacity:0, y:24 },
  show: (i: number) => ({ opacity:1, y:0, transition:{ delay: i*0.07, duration:0.5, ease:[0.16,1,0.3,1] } }),
};

const BADGES_LIST = [
  { id:'first_task', icon:'⭐', name:'First Task', xp:50 },
  { id:'streak_7', icon:'🔥', name:'7-Day Streak', xp:200 },
  { id:'task_100', icon:'🏆', name:'Century', xp:500 },
  { id:'team_player', icon:'🤝', name:'Team Player', xp:150 },
  { id:'speed_demon', icon:'⚡', name:'Speed Demon', xp:300 },
  { id:'project_master', icon:'🚀', name:'Project Master', xp:1000 },
];

const TEMPLATE_EMOJIS: Record<string,string> = {
  'Website Development':'🌐','Portfolio Website':'🎨','E-Commerce Website':'🛍️',
  'Mobile Application':'📱','College Project':'🎓','AI / ML Project':'🤖',
  'Startup Launch':'🚀','Marketing Campaign':'📢','Custom Project':'⚙️',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({ tasks_total:0, tasks_done:0, projects:0, team:0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data:{ data:{} } })),
      api.get('/projects?limit=4').catch(() => ({ data:{ data:[] } })),
      api.get('/tasks?assignee=me&limit=5').catch(() => ({ data:{ data:[] } })),
    ]).then(([s, p, t]) => {
      setStats(s.data.data || {});
      setRecentProjects(p.data.data || []);
      setMyTasks(t.data.data || []);
      setWeeklyData(days.map(day => ({ day, completed:0, created:0 })));
    });
  }, []);

  const level = Math.floor((user?.xp||0)/1000)+1;
  const xpPct = ((user?.xp||0)%1000)/10;
  const xpToNext = 1000-((user?.xp||0)%1000);

  // color tokens
  // color tokens
const textPrimary = isDark ? '#fff' : '#3D1A14';
const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,50,40,0.55)';
const cardBg = isDark ? '#1A1A1A' : '#F7EFED';
const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(180,120,110,0.15)';
const heroBg = isDark
  ? 'linear-gradient(135deg, #1A1A1A 0%, #222222 50%, #181818 100%)'
  : 'linear-gradient(135deg, #EDE0DB 0%, #E4D4CE 50%, #F0E6E2 100%)';
const tooltipBg = isDark ? '#1A1A1A' : '#F7EFED';
const taskBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(180,120,110,0.15)';
const heroBorder = isDark ? 'rgba(232,84,10,0.2)' : 'rgba(180,120,110,0.25)';
const itemHoverBg = isDark ? 'rgba(232,84,10,0.05)' : 'rgba(180,120,110,0.08)';
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: tooltipBg, border:`1px solid rgba(232,84,10,0.2)`, borderRadius:10, padding:'10px 14px', fontSize:12 }}>
        <p style={{ color: textMuted, marginBottom:4, margin:0 }}>{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color, margin:'2px 0' }}>{p.name}: {p.value}</p>)}
      </div>
    );
  };

  const Card = ({ children, style = {} }: any) => (
    <div style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, transition:'all 0.2s ease', ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:1280, margin:'0 auto' }}>

      {/* Hero banner */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        style={{ borderRadius:20, overflow:'hidden', padding:'20px 18px', position:'relative', background: heroBg, border:`1px solid ${heroBorder}` }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,84,10,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h2 style={{ fontSize:26, fontWeight:900, color: textPrimary, margin:'0 0 6px', letterSpacing:'-0.5px' }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p style={{ color: textMuted, fontSize:14, margin:0 }}>
              {stats.tasks_done > 0 ? `You've crushed ${stats.tasks_done} tasks. Keep it up! 🔥` : "Ready to ship something great? Create your first project 🚀"}
            </p>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ padding:'10px 18px', borderRadius:12, background: isDark ? 'rgba(232,84,10,0.15)' : 'rgba(232,84,10,0.1)', border:'1px solid rgba(232,84,10,0.3)', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#E8540A' }}>Lv.{level}</div>
              <div style={{ fontSize:11, color: textMuted, marginTop:2 }}>{xpToNext} XP to next</div>
            </div>
            <div style={{ padding:'10px 18px', borderRadius:12, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)', border:`1px solid ${cardBorder}`, textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:900, color: textPrimary }}>{user?.streak||0}🔥</div>
              <div style={{ fontSize:11, color: textMuted, marginTop:2 }}>Day Streak</div>
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', right:20, bottom:0, fontSize:72, opacity:0.06, lineHeight:1, pointerEvents:'none' }}>🤖</div>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14 }}>
        {[
          { icon:FiCheckSquare, label:'Tasks Done', value:stats.tasks_done||0, color:'#E8540A' },
          { icon:FiClock, label:'In Progress', value:(stats.tasks_total||0)-(stats.tasks_done||0), color:'#FF8C42' },
          { icon:FiTarget, label:'Projects', value:stats.projects||0, color:'#C44B0A' },
          { icon:FiUsers, label:'Teammates', value:stats.team||0, color:'#8B2500' },
        ].map((c, i) => (
          <motion.div key={c.label} custom={i} initial="hidden" animate="show" variants={fadeUp}
            style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:'20px', transition:'all 0.2s' }}>
            <div style={{ display:'flex', alignItems:'start', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <c.icon size={18} style={{ color:c.color }}/>
              </div>
              <FiTrendingUp size={13} style={{ color:'#E8540A', marginTop:4 }}/>
            </div>
            <div style={{ fontSize:28, fontWeight:900, color: textPrimary, letterSpacing:'-1px' }}>{c.value}</div>
            <div style={{ fontSize:12, color: textMuted, marginTop:2 }}>{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
        {/* Weekly chart */}
        <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp}
          style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:24, gridColumn:'span 2' }}>
          <h3 style={{ fontSize:15, fontWeight:800, color: textPrimary, marginBottom:20, letterSpacing:'-0.3px' }}>Weekly Activity 📈</h3>
          {weeklyData.some(d => d.completed > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barGap={4}>
                <XAxis dataKey="day" tick={{ fill: textMuted as string, fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="completed" fill="#E8540A" radius={[6,6,0,0]} name="Completed"/>
                <Bar dataKey="created" fill="rgba(232,84,10,0.3)" radius={[6,6,0,0]} name="Created"/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:160, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
              <div style={{ fontSize:36 }}>📊</div>
              <p style={{ fontSize:13, color: textMuted, textAlign:'center' }}>Complete tasks to see your activity chart</p>
            </div>
          )}
        </motion.div>

        {/* XP card */}
        <motion.div custom={5} initial="hidden" animate="show" variants={fadeUp}
          style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color: textPrimary, marginBottom:20, letterSpacing:'-0.3px' }}>Your Progress 🎮</h3>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:18, background:'linear-gradient(135deg,#E8540A,#6B1010)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:12, position:'relative', boxShadow:'0 0 30px rgba(232,84,10,0.3)' }}>
              🤖
              <div style={{ position:'absolute', bottom:-8, right:-8, width:24, height:24, borderRadius:8, background:'#E8540A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#fff' }}>{level}</div>
            </div>
            <div style={{ fontWeight:800, fontSize:16, color: textPrimary, marginBottom:2 }}>{user?.name}</div>
            <div style={{ fontSize:12, color: textMuted, marginBottom:16 }}>{user?.xp||0} XP total</div>
            <div style={{ width:'100%', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color: textMuted, marginBottom:6 }}>
                <span>Level {level}</span><span>{xpToNext} to Lv.{level+1}</span>
              </div>
              <div style={{ height:4, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(232,84,10,0.15)', borderRadius:2, overflow:'hidden' }}>
                <motion.div style={{ height:'100%', background:'linear-gradient(90deg,#E8540A,#f97316)', borderRadius:2 }} initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ delay:0.5, duration:1.2 }}/>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
        {/* Recent Projects */}
        <motion.div custom={6} initial="hidden" animate="show" variants={fadeUp}
          style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color: textPrimary, letterSpacing:'-0.3px', margin:0 }}>Recent Projects</h3>
            <Link to="/projects" style={{ fontSize:12, color:'#E8540A', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontWeight:700 }}>
              View all <FiArrowRight size={12}/>
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 0', gap:12 }}>
              <div style={{ fontSize:40 }}>🗂️</div>
              <p style={{ fontSize:13, fontWeight:700, color: textPrimary, margin:0 }}>No projects yet!</p>
              <p style={{ fontSize:12, color: textMuted, textAlign:'center', margin:0 }}>Create your first project and let Nesty help plan it 🤖</p>
              <Link to="/projects" style={{ textDecoration:'none' }}>
                <button style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, background:'linear-gradient(135deg,#E8540A,#6B1010)', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'Figtree' }}><FiPlus size={13}/> Create Project</button>
              </Link>
            </div>
          ) : recentProjects.map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:12, cursor:'pointer', border:'1px solid transparent', transition:'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = itemHoverBg; (e.currentTarget as HTMLElement).style.borderColor='rgba(232,84,10,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.borderColor='transparent'; }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#E8540A,#6B1010)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {TEMPLATE_EMOJIS[p.template]||p.icon||'📋'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize:11, color: textMuted, marginTop:1 }}>{p.template}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:900, color:'#E8540A' }}>{p.progress||0}%</div>
                  <div style={{ width:48, height:3, borderRadius:4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(232,84,10,0.12)', marginTop:4 }}>
                    <div style={{ height:'100%', borderRadius:4, background:'#E8540A', width:`${p.progress||0}%`, transition:'width 1s ease' }}/>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* My Tasks */}
        <motion.div custom={7} initial="hidden" animate="show" variants={fadeUp}
          style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color: textPrimary, letterSpacing:'-0.3px', margin:0 }}>My Tasks</h3>
            <Link to="/tasks" style={{ fontSize:12, color:'#E8540A', textDecoration:'none', display:'flex', alignItems:'center', gap:4, fontWeight:700 }}>
              View all <FiArrowRight size={12}/>
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 0', gap:8 }}>
              <div style={{ fontSize:40 }}>✅</div>
              <p style={{ fontSize:13, fontWeight:700, color: textPrimary, margin:0 }}>No tasks assigned!</p>
              <p style={{ fontSize:12, color: textMuted, margin:0 }}>Tasks assigned to you appear here</p>
            </div>
          ) : myTasks.map((task: any) => (
            <div key={task.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, cursor:'pointer', border:`1px solid ${taskBorder}`, marginBottom:8 }}
              onMouseEnter={e => (e.currentTarget.style.background = itemHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
              <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${task.status==='done'?'#E8540A':'rgba(232,84,10,0.3)'}`, background: task.status==='done'?'#E8540A':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff' }}>
                {task.status==='done'&&'✓'}
              </div>
              <span style={{ flex:1, fontSize:13, color: task.status==='done' ? textMuted : textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: task.status==='done'?'line-through':'none' }}>{task.title}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'rgba(232,84,10,0.1)', color:'#E8540A', flexShrink:0 }}>{task.priority}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div custom={8} initial="hidden" animate="show" variants={fadeUp}
        style={{ background: cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:800, color: textPrimary, marginBottom:20, letterSpacing:'-0.3px' }}>Achievements 🏆</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:12 }}>
          {BADGES_LIST.map(badge => {
            const earned = user?.badges?.some((b: any) => b.id === badge.id);
            return (
              <div key={badge.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 8px', borderRadius:14, textAlign:'center', border:`1px solid ${earned?'rgba(232,84,10,0.3)':cardBorder}`, background: earned ? (isDark?'rgba(232,84,10,0.06)':'rgba(232,84,10,0.05)') : 'transparent', opacity: earned?1:0.35, transition:'all 0.2s' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{badge.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color: textPrimary }}>{badge.name}</div>
                <div style={{ fontSize:10, color:'#E8540A', marginTop:4, fontWeight:700 }}>+{badge.xp} XP</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
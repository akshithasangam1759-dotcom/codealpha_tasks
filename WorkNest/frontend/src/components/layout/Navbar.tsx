import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiPlus, FiX, FiCheck, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../../types';

interface NavbarProps {
  title?: string;
  notifications?: Notification[];
  onMarkRead?: (id: number) => void;
  onCreateProject?: () => void;
  petsEnabled?: boolean;
  onTogglePets?: () => void;
  onMenuToggle?: () => void;
}

export default function Navbar({ title = 'Dashboard', notifications = [], onMarkRead, onCreateProject, petsEnabled = false, onTogglePets, onMenuToggle }: NavbarProps) {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const bg = isDark ? 'rgba(15,15,15,0.92)' : 'rgba(249,237,232,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.15)';
  const btnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(196,133,106,0.08)';
  const dropdownBg = isDark ? '#1A1A1A' : '#FFF0EB';
  const textPrimary = isDark ? '#fff' : '#2D1A0E';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(100,60,30,0.5)';

  return (
    
    // ✅ just the <header> — NO VscodePets here anymore!!
    <header style={{ position:'sticky', top:0, zIndex:30, padding:'0 12px', height:64, display:'flex', alignItems:'center', gap:8, background: bg, backdropFilter:'blur(16px)', borderBottom:`1px solid ${border}`, flexShrink:0, transition:'background 0.3s ease' }}>
      {/* Hamburger — mobile only */}
<button
  onClick={onMenuToggle}
  className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl"
  style={{ background: btnBg, border: `1px solid ${border}`, color: textMuted, cursor: 'pointer', flexShrink: 0 }}
>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect y="2" width="16" height="2" rx="1"/>
    <rect y="7" width="16" height="2" rx="1"/>
    <rect y="12" width="16" height="2" rx="1"/>
  </svg>
</button>

<div style={{ flex:1 }}>
  <h1 style={{ fontSize:18, fontWeight:900, color: textPrimary, letterSpacing:'-0.5px', fontFamily:'Figtree', margin:0 }}>{title}</h1>
</div>

      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0, flexWrap:'nowrap' }}>
        {/* New Project */}
        <motion.button onClick={onCreateProject} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'linear-gradient(135deg,#E8540A,#6B1010)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'Figtree', boxShadow:'0 4px 16px rgba(232,84,10,0.3)' }}>
          <FiPlus size={15}/>
          <span className="hidden sm:inline">New</span>
        </motion.button>

        {/* Notifications */}
        <div style={{ position:'relative' }}>
          <motion.button onClick={() => setShowNotifs(s => !s)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            style={{ position:'relative', width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background: btnBg, border:`1px solid ${border}`, cursor:'pointer', color: textMuted }}>
            <FiBell size={16}/>
            {unread > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#E8540A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff', boxShadow:'0 0 8px rgba(232,84,10,0.6)' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:320, borderRadius:16, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.2)', zIndex:50, background: dropdownBg, border:`1px solid ${border}` }}>
                <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${border}` }}>
                  <span style={{ fontWeight:700, fontSize:13, color: textPrimary }}>
                    Notifications {unread > 0 && <span style={{ marginLeft:6, padding:'1px 8px', borderRadius:100, background:'rgba(232,84,10,0.15)', color:'#E8540A', fontSize:11 }}>{unread}</span>}
                  </span>
                  <button onClick={() => setShowNotifs(false)} style={{ background:'none', border:'none', cursor:'pointer', color: textMuted, display:'flex' }}><FiX size={15}/></button>
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding:32, textAlign:'center' }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
                      <p style={{ fontSize:13, color: textMuted }}>All caught up!</p>
                    </div>
                  ) : notifications.slice(0,10).map(n => (
                    <div key={n.id} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.04)':'rgba(232,84,10,0.06)'}`, opacity: n.read ? 0.5 : 1, cursor:'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(232,84,10,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <div style={{ width:32, height:32, borderRadius:10, background:'rgba(232,84,10,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                        {n.type==='task_assigned'?'📋':n.type==='comment'?'💬':n.type==='achievement'?'🏆':'📢'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:700, color: textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{n.title}</p>
                        <p style={{ fontSize:11, color: textMuted, marginTop:2, margin:0 }}>{n.message}</p>
                        <p style={{ fontSize:10, color:'rgba(232,84,10,0.6)', marginTop:4, margin:0 }}>{formatDistanceToNow(new Date(n.created_at), {addSuffix:true})}</p>
                      </div>
                      {!n.read && onMarkRead && (
                        <button onClick={e => { e.stopPropagation(); onMarkRead(n.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#E8540A', display:'flex', flexShrink:0 }}><FiCheck size={14}/></button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pets toggle — still hidden on mobile */}
<motion.button className="hide-mobile" onClick={onTogglePets} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
  title={petsEnabled ? 'Hide pets' : 'Show pets'}
  style={{ 
    width:38, height:38, borderRadius:10, alignItems:'center', justifyContent:'center', 
    background: petsEnabled ? 'rgba(232,84,10,0.15)' : btnBg, 
    border:`1px solid ${petsEnabled ? '#E8540A' : border}`, 
    cursor:'pointer', fontSize:16, transition:'all 0.2s', flexShrink:0
  }}>
  🐾
</motion.button>

{/* Theme toggle — always visible */}
<motion.button onClick={toggleTheme} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
  style={{ 
    width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', 
    background: btnBg, border:`1px solid ${border}`, 
    cursor:'pointer', color: isDark ? 'rgba(255,255,255,0.7)' : '#E8540A',
    flexShrink:0
  }}>
  {isDark ? <FiSun size={15}/> : <FiMoon size={15}/>}
</motion.button>

        {/* Avatar */}
        <motion.div whileHover={{ scale:1.05 }}
          style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#E8540A,#6B1010)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff', cursor:'pointer', boxShadow:'0 0 16px rgba(232,84,10,0.3)', flexShrink:0 }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </motion.div>
      </div>
      {/* ✅ VscodePets is GONE from here — it lives in MainLayout now!! */}
    </header>
  );
}
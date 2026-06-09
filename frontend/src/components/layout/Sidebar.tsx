import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiGrid, FiCheckSquare, FiUsers, FiBarChart2, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight, FiSearch, FiPlus, FiZap, FiMessageSquare, FiVideo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { icon: FiHome,          label: 'Dashboard', path: '/dashboard' },
  { icon: FiGrid,          label: 'Projects',  path: '/projects'  },
  { icon: FiCheckSquare,   label: 'My Tasks',  path: '/tasks'     },
  { icon: FiUsers,         label: 'Team',      path: '/team'      },
  { icon: FiBarChart2,     label: 'Analytics', path: '/analytics' },
  { icon: FiMessageSquare, label: 'Chat',      path: '/chat'      },
  { icon: FiVideo,         label: 'Calls',     path: '/calls'     },
];

type PetType = 'cat' | 'dog' | 'dino' | 'ghost';

function drawCat(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1,1); ctx.translate(-32,0); }
  const leg = state==='idle' ? 0 : frame%2===0 ? 1 : -1;
  ctx.fillStyle='#f97316';
  ctx.fillRect(6,10,20,14); ctx.fillRect(16,2,14,12);
  ctx.fillRect(16,0,4,4);   ctx.fillRect(24,0,4,4);
  ctx.fillStyle='#fca5a5';
  ctx.fillRect(17,1,2,2);   ctx.fillRect(25,1,2,2);
  ctx.fillStyle='#1a1a1a';
  ctx.fillRect(19,6,2,2);   ctx.fillRect(25,6,2,2);
  ctx.fillStyle='#fff';
  ctx.fillRect(20,6,1,1);   ctx.fillRect(26,6,1,1);
  ctx.fillStyle='#fca5a5';  ctx.fillRect(22,9,2,1);
  ctx.fillStyle='#1a1a1a';
  ctx.fillRect(21,10,1,1);  ctx.fillRect(23,10,1,1);
  ctx.fillStyle='#f97316';
  ctx.fillRect(2,12,6,3);   ctx.fillRect(2,9,3,4);
  ctx.fillStyle='#ea580c';
  ctx.fillRect(8,22,4,4+leg);  ctx.fillRect(14,22,4,4-leg);
  ctx.fillRect(20,22,4,4+leg); ctx.fillRect(26,22,4,4-leg);
  ctx.fillRect(10,12,2,6);  ctx.fillRect(16,12,2,6);
  ctx.restore();
}
function drawDog(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1,1); ctx.translate(-32,0); }
  const leg = state==='idle' ? 0 : frame%2===0 ? 1 : -1;
  ctx.fillStyle='#d97706';
  ctx.fillRect(4,12,22,12); ctx.fillRect(18,2,14,13);
  ctx.fillStyle='#fbbf24'; ctx.fillRect(26,7,6,6);
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(28,7,3,2); ctx.fillRect(20,5,2,2);
  ctx.fillStyle='#fff';    ctx.fillRect(21,5,1,1);
  ctx.fillStyle='#92400e';
  ctx.fillRect(16,2,5,8);  ctx.fillRect(28,2,5,7);
  ctx.fillStyle='#d97706';
  ctx.fillRect(2,8,4,4);   ctx.fillRect(1,5,3,4);
  ctx.fillStyle='#b45309';
  ctx.fillRect(6,22,4,4+leg);  ctx.fillRect(12,22,4,4-leg);
  ctx.fillRect(18,22,4,4+leg); ctx.fillRect(22,22,4,4-leg);
  ctx.restore();
}
function drawDino(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1,1); ctx.translate(-32,0); }
  const leg = state==='idle' ? 0 : frame%2===0 ? 2 : 0;
  ctx.fillStyle='#059669';
  ctx.fillRect(0,16,8,5); ctx.fillRect(3,14,5,4);
  ctx.fillStyle='#10b981'; ctx.fillRect(6,8,18,18);
  ctx.fillStyle='#6ee7b7'; ctx.fillRect(10,14,10,10);
  ctx.fillStyle='#10b981'; ctx.fillRect(18,0,14,12);
  ctx.fillStyle='#059669';
  ctx.fillRect(8,4,3,5); ctx.fillRect(13,2,3,6); ctx.fillRect(18,1,3,5);
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(27,3,3,3);
  ctx.fillStyle='#fff';    ctx.fillRect(28,3,1,1);
  ctx.fillStyle='#047857'; ctx.fillRect(28,8,4,2);
  ctx.fillStyle='#fff';
  ctx.fillRect(29,8,1,1); ctx.fillRect(31,8,1,1);
  ctx.fillStyle='#059669'; ctx.fillRect(20,14,4,3);
  ctx.fillRect(10,24,5,4+leg); ctx.fillRect(18,24,5,4-leg);
  ctx.restore();
}
function drawGhost(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, _s: string) {
  ctx.save();
  if (flip) { ctx.scale(-1,1); ctx.translate(-32,0); }
  const fy = Math.sin(frame*0.3)*2;
  ctx.fillStyle='rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(16,30,9,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e0f2fe';
  ctx.fillRect(4,10+fy,24,16);
  ctx.beginPath(); ctx.arc(16,10+fy,12,Math.PI,0); ctx.fill();
  for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(6+i*7,26+fy,3.5,0,Math.PI);ctx.fill();}
  ctx.fillStyle='#0ea5e9';
  ctx.fillRect(9,9+fy,4,5); ctx.fillRect(19,9+fy,4,5);
  ctx.fillStyle='#fff';
  ctx.fillRect(10,9+fy,2,2); ctx.fillRect(20,9+fy,2,2);
  ctx.fillStyle='rgba(251,113,133,0.5)';
  ctx.fillRect(7,14+fy,4,2); ctx.fillRect(21,14+fy,4,2);
  ctx.fillStyle='#0284c7'; ctx.fillRect(13,16+fy,6,2);
  ctx.restore();
}

const DRAWERS = { cat:drawCat, dog:drawDog, dino:drawDino, ghost:drawGhost };
const PET_TYPES: PetType[] = ['cat','dog','dino','ghost'];
const BUBBLES = ['hi!! 👋','meow~','rawr!','boo~','woof!','uwu','*yawns*','pet me!!',':3'];

interface Pet {
  id:number; type:PetType; x:number; vx:number;
  state:'walk'|'idle'|'jump'; frame:number; stateTimer:number;
  vy:number; y:number; bubble:string|null; bubbleTimer:number;
}

function PetCanvas({pet,size}:{pet:Pet;size:number}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d')!;
    ctx.clearRect(0,0,32,32);
    ctx.imageSmoothingEnabled=false;
    DRAWERS[pet.type](ctx,pet.frame,pet.vx<0,pet.state);
  });
  return <canvas ref={ref} width={32} height={32} style={{imageRendering:'pixelated',width:size,height:size}}/>;
}

// ── vscode-style open ground strip ────────────────────────────
function PetStrip({isDark,zoneW,petsEnabled}:{isDark:boolean;zoneW:number;petsEnabled:boolean}) {
  const [pets,setPets] = useState<Pet[]>([]);
  const [size,setSize] = useState(36);
  const petsRef  = useRef<Pet[]>([]);
  const frameRef = useRef<number>();
  const tickRef  = useRef(0);

  useEffect(()=>{
    if(!petsEnabled){
      setPets([]); petsRef.current=[];
      if(frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    const initial:Pet[] = Array.from({length:3},(_,i)=>({
      id:i, type:PET_TYPES[Math.floor(Math.random()*PET_TYPES.length)],
      x:16+(zoneW/3)*i, y:0, vy:0,
      vx:(Math.random()>.5?1:-1)*(0.2+Math.random()*0.25),
      state:'walk' as const, frame:0,
      stateTimer:80+Math.floor(Math.random()*120),
      bubble:null, bubbleTimer:0,
    }));
    petsRef.current=initial; setPets([...initial]);
  },[petsEnabled,zoneW]);

  useEffect(()=>{
    if(!petsEnabled) return;
    const loop=()=>{
      tickRef.current++;
      petsRef.current = petsRef.current.map(p=>{
        let {x,y,vx,vy,state,frame,stateTimer,bubble,bubbleTimer}=p;
        stateTimer--;
        if(stateTimer<=0){
          const r=Math.random();
          if(r<.5){state='walk';vx=(Math.random()>.5?1:-1)*(0.2+Math.random()*.25);}
          else if(r<.75){state='idle';vx=0;}
          else{state='jump';vy=-(1.8+Math.random()*1.0);}
          stateTimer=80+Math.floor(Math.random()*200);
          if(Math.random()<.18){bubble=BUBBLES[Math.floor(Math.random()*BUBBLES.length)];bubbleTimer=80;}
        }
        if(bubbleTimer>0) bubbleTimer--; else bubble=null;
        if(state==='jump'||y>0){vy+=0.2;y+=vy;if(y>=0){y=0;vy=0;state='walk';vx=(Math.random()>.5?1:-1)*.25;}}
        x+=vx;
        const maxX=zoneW-size-4;
        if(x<4){x=4;vx=Math.abs(vx);}
        if(x>maxX){x=maxX;vx=-Math.abs(vx);}
        if(tickRef.current%10===0) frame=(frame+1)%8;
        return {...p,x,y,vx,vy,state,frame,stateTimer,bubble,bubbleTimer};
      });
      setPets([...petsRef.current]);
      frameRef.current=requestAnimationFrame(loop);
    };
    frameRef.current=requestAnimationFrame(loop);
    return()=>{if(frameRef.current) cancelAnimationFrame(frameRef.current);};
  },[petsEnabled,zoneW,size]);

  const groundColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(196,133,106,0.25)';
  const textMuted   = isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(100,60,30,0.35)';

  return (
    <div style={{position:'relative',width:'100%',height:size+28,flexShrink:0}}>

      {/* size slider — tiny, floats top-right */}
      <div style={{position:'absolute',top:2,right:8,display:'flex',alignItems:'center',gap:4,zIndex:2}}>
        <span style={{fontSize:8,color:textMuted,fontFamily:'Figtree',fontWeight:700}}>{size}px</span>
        <input type="range" min={24} max={52} value={size}
          onChange={e=>setSize(+e.target.value)}
          style={{width:44,accentColor:'#E8540A',cursor:'pointer'}}/>
      </div>

      {/* ground line — single thin line, just like vscode pets */}
      <div style={{position:'absolute',bottom:8,left:0,right:0,height:1,background:groundColor}}/>

      {/* pets */}
      {petsEnabled && pets.map(pet=>(
        <div key={pet.id} style={{
          position:'absolute', bottom:9, left:pet.x,
          transform:`translateY(${-pet.y}px)`,
        }}>
          {pet.bubble && pet.bubbleTimer>0 && (
            <motion.div
              initial={{opacity:0,y:3,scale:.8}}
              animate={{opacity:1,y:0,scale:1}}
              style={{
                position:'absolute',bottom:size+4,left:'50%',
                transform:'translateX(-50%)',
                background:'#fff',border:'1.5px solid #E8540A',
                borderRadius:6,padding:'2px 6px',
                fontSize:9,fontWeight:700,fontFamily:'Figtree',
                whiteSpace:'nowrap',color:'#1a1a1a',
                boxShadow:'0 2px 8px rgba(0,0,0,0.15)',zIndex:2,
              }}>
              {pet.bubble}
              <div style={{position:'absolute',bottom:-5,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'3px solid transparent',borderRight:'3px solid transparent',borderTop:'5px solid #E8540A'}}/>
            </motion.div>
          )}
          <motion.div whileHover={{scale:1.3}} style={{cursor:'pointer'}}
            onClick={()=>{
              petsRef.current=petsRef.current.map(p=>
                p.id===pet.id?{...p,bubble:BUBBLES[Math.floor(Math.random()*BUBBLES.length)],bubbleTimer:80,state:'jump',vy:-2}:p
              );
            }}>
            <PetCanvas pet={pet} size={size}/>
          </motion.div>
        </div>
      ))}

      {!petsEnabled && (
        <div style={{position:'absolute',bottom:14,left:0,right:0,display:'flex',justifyContent:'center'}}>
          <span style={{fontSize:10,color:textMuted,fontFamily:'Figtree'}}>zzz 💤</span>
        </div>
      )}
    </div>
  );
}

// ── main Sidebar ───────────────────────────────────────────────
export default function Sidebar({ workspaces=[], onCreateWorkspace }: { workspaces?:any[]; onCreateWorkspace?:()=>void }) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [petsEnabled,  setPetsEnabled]  = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const level = Math.floor((user?.xp||0)/1000)+1;
  const xpPct = ((user?.xp||0)%1000)/10;
  const sidebarWidth = collapsed ? 68 : 248;

  const bg          = isDark ? '#111111' : '#F2DDD8';
  const border      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.2)';
  const textPrimary = isDark ? '#fff' : '#2D1A0E';
  const textMuted   = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(100,60,30,0.5)';
  const activeItemBg= isDark ? 'rgba(232,84,10,0.12)' : 'rgba(232,84,10,0.1)';
  const itemHoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(232,84,10,0.06)';
  const searchBg    = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(196,133,106,0.08)';
  const userCardBg  = isDark ? 'rgba(232,84,10,0.06)' : 'rgba(196,133,106,0.12)';

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
      style={{ height:'100vh', display:'flex', flexDirection:'column', position:'sticky', top:0, zIndex:40, overflow:'hidden', minWidth:sidebarWidth, background:bg, borderRight:`1px solid ${border}`, flexShrink:0, transition:'background 0.3s ease' }}
    >
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:collapsed?'20px 16px':'20px 18px',marginBottom:4}}>
        <motion.div whileHover={{rotate:10}} style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#E8540A,#6B1010)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,boxShadow:'0 0 20px rgba(232,84,10,0.3)',cursor:'pointer'}}>🤖</motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
              style={{fontSize:18,fontWeight:900,color:textPrimary,whiteSpace:'nowrap',letterSpacing:'-0.5px'}}>
              Work<span style={{color:'#E8540A'}}>Nest</span>
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{marginLeft:'auto',padding:6,borderRadius:8,border:`1px solid ${border}`,background:searchBg,color:textMuted,cursor:'pointer',display:'flex',flexShrink:0}}>
          {collapsed?<FiChevronRight size={14}/>:<FiChevronLeft size={14}/>}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{padding:'0 12px 12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:10,background:searchBg,border:`1px solid ${border}`}}>
            <FiSearch size={13} style={{color:textMuted}}/>
            <span style={{fontSize:12,color:textMuted,fontFamily:'Figtree'}}>Search... (Ctrl+K)</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{flex:1,padding:'0 8px',display:'flex',flexDirection:'column',gap:2,overflowY:'auto'}} className="scrollbar-hide">
        {!collapsed && <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:textMuted,padding:'8px 10px 4px',textTransform:'uppercase'}}>Menu</span>}
        {navItems.map(item=>{
          const active=location.pathname===item.path;
          return (
            <Link key={item.path} to={item.path} style={{textDecoration:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'10px 12px',borderRadius:10,cursor:'pointer',justifyContent:collapsed?'center':'flex-start',background:active?activeItemBg:'transparent',color:active?'#E8540A':textPrimary,fontWeight:active?700:500,fontSize:13,fontFamily:'Figtree',transition:'all 0.15s ease'}}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.background=itemHoverBg;}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
                <item.icon size={17} style={{flexShrink:0,color:active?'#E8540A':textMuted}}/>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && <div style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#E8540A',boxShadow:'0 0 8px rgba(232,84,10,0.8)'}}/>}
              </div>
            </Link>
          );
        })}

        {/* Workspaces */}
        {!collapsed && (
          <div style={{marginTop:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px 6px'}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:textMuted,textTransform:'uppercase'}}>Workspaces</span>
              <button onClick={onCreateWorkspace} style={{background:'none',border:'none',cursor:'pointer',color:'#E8540A',display:'flex',padding:2}}><FiPlus size={13}/></button>
            </div>
            {workspaces.length===0?(
              <div style={{padding:'12px 10px',textAlign:'center'}}>
                <p style={{fontSize:11,color:textMuted,marginBottom:6}}>No workspaces yet</p>
                <button onClick={onCreateWorkspace} style={{fontSize:11,color:'#E8540A',background:'none',border:'none',cursor:'pointer',fontFamily:'Figtree',fontWeight:700}}>+ Create one</button>
              </div>
            ):workspaces.map((ws:any)=>(
              <Link key={ws.id} to={`/workspace/${ws.id}`} style={{textDecoration:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,cursor:'pointer',color:textPrimary,fontSize:13,fontFamily:'Figtree'}}
                  onMouseEnter={e=>e.currentTarget.style.background=itemHoverBg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:22,height:22,borderRadius:6,background:ws.color||'#E8540A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}}>{ws.name[0]}</div>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ws.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ✅ PETS SECTION — vscode style, open ground, no box */}
      {!collapsed && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 14px 0'}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:3,color:textMuted,textTransform:'uppercase'}}>Pets</span>
            <motion.button
              onClick={()=>setPetsEnabled(s=>!s)}
              whileTap={{scale:0.85}}
              title={petsEnabled?'Hide pets':'Show pets'}
              style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:2,opacity:petsEnabled?1:0.35,transition:'opacity 0.2s'}}>
              🐾
            </motion.button>
          </div>
          <PetStrip isDark={isDark} zoneW={sidebarWidth} petsEnabled={petsEnabled}/>
        </>
      )}

      {/* Bottom */}
      <div style={{padding:'8px',borderTop:`1px solid ${border}`}}>
        <Link to="/settings" style={{textDecoration:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:collapsed?'10px 0':'10px 12px',borderRadius:10,cursor:'pointer',color:textMuted,fontSize:13,fontFamily:'Figtree',justifyContent:collapsed?'center':'flex-start'}}
            onMouseEnter={e=>e.currentTarget.style.background=itemHoverBg}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <FiSettings size={16} style={{flexShrink:0}}/>
            {!collapsed && <span>Settings</span>}
          </div>
        </Link>

        <div style={{display:'flex',alignItems:'center',gap:10,padding:collapsed?'8px 6px':'10px 10px',borderRadius:12,marginTop:4,background:userCardBg,border:`1px solid ${border}`,cursor:'pointer'}}>
          <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#E8540A,#6B1010)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0}}>
            {user?.name?.[0]?.toUpperCase()||'U'}
          </div>
          {!collapsed && (
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:textPrimary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:1}}>
                <FiZap size={9} style={{color:'#E8540A'}}/>
                <span style={{fontSize:10,color:textMuted}}>Lv.{level} · {user?.xp||0} XP</span>
              </div>
              <div style={{height:4,background:isDark?'rgba(255,255,255,0.1)':'rgba(232,84,10,0.15)',borderRadius:2,overflow:'hidden',marginTop:4}}>
                <motion.div style={{height:'100%',background:'linear-gradient(90deg,#E8540A,#f97316)',borderRadius:2}} initial={{width:0}} animate={{width:`${xpPct}%`}} transition={{delay:.5,duration:1}}/>
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} title="Logout"
              style={{background:'none',border:'none',cursor:'pointer',color:textMuted,padding:4,borderRadius:6,display:'flex'}}
              onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')}
              onMouseLeave={e=>(e.currentTarget.style.color=textMuted)}>
              <FiLogOut size={14}/>
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  FiEdit2, FiMinus, FiCircle, FiSquare, FiTrash2,
  FiDownload, FiPlus, FiX, FiMousePointer
} from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Tool = 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'select';

interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface DrawEvent {
  tool: Tool;
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

const COLORS = ['#E8540A', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#ec4899', '#ffffff', '#000000'];
const STICKY_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'];

export default function WhiteboardPage() {
  const { projectId } = useParams();
  const { socket } = useSocket();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#E8540A');
  const [brushSize, setBrushSize] = useState(4);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [draggingSticky, setDraggingSticky] = useState<string | null>(null);
  const [editingSticky, setEditingSticky] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // colors
  const bg = isDark ? '#111' : '#FAF5F2';
  const toolbarBg = isDark ? '#1A1A1A' : '#FFF0EB';
  const textPrimary = isDark ? '#fff' : '#2D1208';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,60,30,0.5)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.2)';

  // init canvas
  // Replace the init canvas useEffect:
useEffect(() => {
  const canvas = canvasRef.current;
  const overlay = overlayRef.current;
  if (!canvas || !overlay) return;

  const resize = () => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    overlay.width = overlay.offsetWidth;
    overlay.height = overlay.offsetHeight;
    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  };

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  overlay.width = overlay.offsetWidth;
  overlay.height = overlay.offsetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  return () => ro.disconnect();
}, [isDark]);

  // socket: join project room + listen for remote draws
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('join:project', projectId);

    const handleRemoteDraw = (data: DrawEvent & { userId: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      drawOnCanvas(ctx, data, false);
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast('Board cleared by teammate! 🧹');
    };

    const handleStickyAdd = (sticky: StickyNote) => setStickies(p => [...p, sticky]);
    const handleStickyMove = ({ id, x, y }: { id: string; x: number; y: number }) =>
      setStickies(p => p.map(s => s.id === id ? { ...s, x, y } : s));
    const handleStickyDelete = ({ id }: { id: string }) =>
      setStickies(p => p.filter(s => s.id !== id));

    socket.on('whiteboard:draw', handleRemoteDraw);
    socket.on('whiteboard:clear', handleClear);
    socket.on('whiteboard:sticky-add', handleStickyAdd);
    socket.on('whiteboard:sticky-move', handleStickyMove);
    socket.on('whiteboard:sticky-delete', handleStickyDelete);

    return () => {
      socket.off('whiteboard:draw', handleRemoteDraw);
      socket.off('whiteboard:clear', handleClear);
      socket.off('whiteboard:sticky-add', handleStickyAdd);
      socket.off('whiteboard:sticky-move', handleStickyMove);
      socket.off('whiteboard:sticky-delete', handleStickyDelete);
    };
  }, [socket, projectId, isDark]);

  const drawOnCanvas = useCallback((ctx: CanvasRenderingContext2D, data: DrawEvent, emit: boolean) => {
    ctx.strokeStyle = data.tool === 'eraser' ? (isDark ? '#1a1a1a' : '#ffffff') : data.color;
    ctx.lineWidth = data.tool === 'eraser' ? data.size * 4 : data.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (data.tool === 'pen' || data.tool === 'eraser') {
      const pts = data.points || [];
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    } else if (data.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(data.startX!, data.startY!);
      ctx.lineTo(data.endX!, data.endY!);
      ctx.stroke();
    } else if (data.tool === 'rect') {
      ctx.strokeRect(data.startX!, data.startY!, data.endX! - data.startX!, data.endY! - data.startY!);
    } else if (data.tool === 'circle') {
      const rx = Math.abs(data.endX! - data.startX!) / 2;
      const ry = Math.abs(data.endY! - data.startY!) / 2;
      const cx = data.startX! + (data.endX! - data.startX!) / 2;
      const cy = data.startY! + (data.endY! - data.startY!) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (emit && socket && projectId) {
      socket.emit('whiteboard:draw', { ...data, projectId });
    }
  }, [isDark, socket, projectId]);

  // Replace getPos with this:
const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current!;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  if ('touches' in e) {
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

  const penPoints = useRef<{ x: number; y: number }[]>([]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return;
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    shapeStart.current = pos;
    penPoints.current = [pos];

    if (['line', 'rect', 'circle'].includes(tool)) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);

    if (tool === 'pen' || tool === 'eraser') {
      penPoints.current.push(pos);
      drawOnCanvas(ctx, { tool, color, size: brushSize, points: [lastPos.current!, pos] }, false);
      lastPos.current = pos;
    } else {
      // shape preview on overlay
      const overlay = overlayRef.current!;
      const octx = overlay.getContext('2d')!;
      octx.clearRect(0, 0, overlay.width, overlay.height);
      octx.strokeStyle = color;
      octx.lineWidth = brushSize;
      octx.lineCap = 'round';
      const s = shapeStart.current!;

      if (tool === 'line') {
        octx.beginPath(); octx.moveTo(s.x, s.y); octx.lineTo(pos.x, pos.y); octx.stroke();
      } else if (tool === 'rect') {
        octx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - s.x) / 2, ry = Math.abs(pos.y - s.y) / 2;
        const cx = s.x + (pos.x - s.x) / 2, cy = s.y + (pos.y - s.y) / 2;
        octx.beginPath(); octx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); octx.stroke();
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    const s = shapeStart.current!;

    if (tool === 'pen' || tool === 'eraser') {
      drawOnCanvas(ctx, { tool, color, size: brushSize, points: penPoints.current }, true);
      penPoints.current = [];
    } else {
      const overlay = overlayRef.current!;
      const octx = overlay.getContext('2d')!;
      octx.clearRect(0, 0, overlay.width, overlay.height);
      const data: DrawEvent = { tool, color, size: brushSize, startX: s.x, startY: s.y, endX: pos.x, endY: pos.y };
      drawOnCanvas(ctx, data, true);
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStickies([]);
    socket?.emit('whiteboard:clear', { projectId });
    toast.success('Board cleared!! 🧹');
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement('a');
    a.download = `whiteboard-${projectId}.png`;
    a.href = canvas.toDataURL();
    a.click();
    toast.success('Downloaded!! 📥');
  };

  const addSticky = () => {
    const sticky: StickyNote = {
      id: `${Date.now()}-${user?.id}`,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      text: 'Click to edit...',
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
    };
    setStickies(p => [...p, sticky]);
    setEditingSticky(sticky.id);
    socket?.emit('whiteboard:sticky-add', { ...sticky, projectId });
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <FiMousePointer size={16}/>, label: 'Select' },
    { id: 'pen', icon: <FiEdit2 size={16}/>, label: 'Pen' },
    { id: 'eraser', icon: <span style={{ fontSize: 14 }}>⬜</span>, label: 'Eraser' },
    { id: 'line', icon: <FiMinus size={16}/>, label: 'Line' },
    { id: 'rect', icon: <FiSquare size={16}/>, label: 'Rect' },
    { id: 'circle', icon: <FiCircle size={16}/>, label: 'Circle' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}` }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: toolbarBg, borderBottom: `1px solid ${border}`, flexWrap: 'wrap' }}>

        {/* Tools */}
        <div style={{ display: 'flex', gap: 4, padding: '4px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(196,133,106,0.1)', borderRadius: 12 }}>
          {tools.map(t => (
            <motion.button key={t.id} onClick={() => setTool(t.id)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              title={t.label}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tool === t.id ? 'linear-gradient(135deg,#E8540A,#6B1010)' : 'transparent',
                color: tool === t.id ? '#fff' : textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
              {t.icon}
            </motion.button>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: border }}/>

        {/* Colors */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {COLORS.map(c => (
            <motion.button key={c} onClick={() => setColor(c)}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              style={{
                width: color === c ? 26 : 22, height: color === c ? 26 : 22,
                borderRadius: '50%', border: color === c ? '2px solid #E8540A' : `2px solid ${border}`,
                background: c, cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: color === c ? '0 0 8px rgba(232,84,10,0.5)' : 'none',
              }}/>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: border }}/>

        {/* Brush size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: textMuted, fontWeight: 700 }}>SIZE</span>
          <input type="range" min={1} max={20} value={brushSize} onChange={e => setBrushSize(+e.target.value)}
            style={{ width: 80, accentColor: '#E8540A' }}/>
          <span style={{ fontSize: 11, color: textPrimary, fontWeight: 700, minWidth: 16 }}>{brushSize}</span>
        </div>

        <div style={{ width: 1, height: 28, background: border }}/>

        {/* Actions */}
        <motion.button onClick={addSticky} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(232,84,10,0.12)', color: '#E8540A', fontSize: 12, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <FiPlus size={13}/> Sticky
        </motion.button>

        <motion.button onClick={downloadBoard} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.12)', color: textMuted, fontSize: 12, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <FiDownload size={13}/> Save
        </motion.button>

        <motion.button onClick={clearBoard} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <FiTrash2 size={13}/> Clear
        </motion.button>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef}
  style={{ position:'absolute', inset:0, width:'100%', height:'100%', cursor: tool==='eraser'?'cell':tool==='select'?'default':'crosshair', touchAction:'none' }}
  onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
  onMouseLeave={() => { isDrawing.current = false; }}
  onTouchStart={e => { e.preventDefault(); onMouseDown(e as any); }}
  onTouchMove={e => { e.preventDefault(); onMouseMove(e as any); }}
  onTouchEnd={e => { e.preventDefault(); onMouseUp(e as any); }}
/>
        <canvas ref={overlayRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* Sticky notes */}
        <AnimatePresence>
          {stickies.map(sticky => (
            <motion.div key={sticky.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              drag={editingSticky !== sticky.id}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const newX = sticky.x + info.offset.x;
                const newY = sticky.y + info.offset.y;
                setStickies(p => p.map(s => s.id === sticky.id ? { ...s, x: newX, y: newY } : s));
                socket?.emit('whiteboard:sticky-move', { id: sticky.id, x: newX, y: newY, projectId });
              }}
              style={{
                position: 'absolute', left: sticky.x, top: sticky.y,
                width: 160, minHeight: 120, background: sticky.color,
                borderRadius: 12, padding: 12, cursor: editingSticky === sticky.id ? 'text' : 'grab',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: draggingSticky === sticky.id ? 100 : 10,
              }}>
              <button onClick={() => {
                setStickies(p => p.filter(s => s.id !== sticky.id));
                socket?.emit('whiteboard:sticky-delete', { id: sticky.id, projectId });
              }}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                <FiX size={10}/>
              </button>
              {editingSticky === sticky.id ? (
                <textarea
                  autoFocus
                  value={sticky.text}
                  onChange={e => setStickies(p => p.map(s => s.id === sticky.id ? { ...s, text: e.target.value } : s))}
                  onBlur={() => setEditingSticky(null)}
                  style={{ width: '100%', minHeight: 80, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Figtree', color: '#1a1a1a', resize: 'none', fontWeight: 600 }}
                />
              ) : (
                <div onDoubleClick={() => setEditingSticky(sticky.id)}
                  style={{ fontSize: 13, fontFamily: 'Figtree', color: '#1a1a1a', fontWeight: 600, minHeight: 80, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {sticky.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
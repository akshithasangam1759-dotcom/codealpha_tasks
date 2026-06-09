import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Pet {
  id: number;
  type: 'cat' | 'dog' | 'dino' | 'ghost';
  x: number;
  vx: number;
  state: 'walk' | 'idle' | 'jump';
  frame: number;
  stateTimer: number;
  vy: number;
  y: number;
  bubble: string | null;
  bubbleTimer: number;
}

const BUBBLES = ['hi!! 👋', 'meow~', 'rawr!', 'boo~', 'woof!', 'uwu', '*yawns*', 'pet me!!', 'so cute!!', ':3'];

function drawCat(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1, 1); ctx.translate(-32, 0); }
  const leg = state === 'idle' ? 0 : (frame % 2 === 0 ? 1 : -1);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(6, 10, 20, 14); ctx.fillRect(16, 2, 14, 12);
  ctx.fillRect(16, 0, 4, 4); ctx.fillRect(24, 0, 4, 4);
  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(17, 1, 2, 2); ctx.fillRect(25, 1, 2, 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(19, 6, 2, 2); ctx.fillRect(25, 6, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(20, 6, 1, 1); ctx.fillRect(26, 6, 1, 1);
  ctx.fillStyle = '#fca5a5'; ctx.fillRect(22, 9, 2, 1);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(21, 10, 1, 1); ctx.fillRect(23, 10, 1, 1);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(2, 12, 6, 3); ctx.fillRect(2, 9, 3, 4);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(8, 22, 4, 4 + leg); ctx.fillRect(14, 22, 4, 4 - leg);
  ctx.fillRect(20, 22, 4, 4 + leg); ctx.fillRect(26, 22, 4, 4 - leg);
  ctx.fillRect(10, 12, 2, 6); ctx.fillRect(16, 12, 2, 6);
  ctx.restore();
}

function drawDog(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1, 1); ctx.translate(-32, 0); }
  const leg = state === 'idle' ? 0 : (frame % 2 === 0 ? 1 : -1);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(4, 12, 22, 12); ctx.fillRect(18, 2, 14, 13);
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(26, 7, 6, 6);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(28, 7, 3, 2); ctx.fillRect(20, 5, 2, 2);
  ctx.fillStyle = '#fff'; ctx.fillRect(21, 5, 1, 1);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(16, 2, 5, 8); ctx.fillRect(28, 2, 5, 7);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(2, 8, 4, 4); ctx.fillRect(1, 5, 3, 4);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(6, 22, 4, 4 + leg); ctx.fillRect(12, 22, 4, 4 - leg);
  ctx.fillRect(18, 22, 4, 4 + leg); ctx.fillRect(22, 22, 4, 4 - leg);
  ctx.restore();
}

function drawDino(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1, 1); ctx.translate(-32, 0); }
  const leg = state === 'idle' ? 0 : (frame % 2 === 0 ? 2 : 0);
  ctx.fillStyle = '#059669';
  ctx.fillRect(0, 16, 8, 5); ctx.fillRect(3, 14, 5, 4);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(6, 8, 18, 18);
  ctx.fillStyle = '#6ee7b7'; ctx.fillRect(10, 14, 10, 10);
  ctx.fillStyle = '#10b981'; ctx.fillRect(18, 0, 14, 12);
  ctx.fillStyle = '#059669';
  ctx.fillRect(8, 4, 3, 5); ctx.fillRect(13, 2, 3, 6); ctx.fillRect(18, 1, 3, 5);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(27, 3, 3, 3);
  ctx.fillStyle = '#fff'; ctx.fillRect(28, 3, 1, 1);
  ctx.fillStyle = '#047857'; ctx.fillRect(28, 8, 4, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(29, 8, 1, 1); ctx.fillRect(31, 8, 1, 1);
  ctx.fillStyle = '#059669'; ctx.fillRect(20, 14, 4, 3);
  ctx.fillRect(10, 24, 5, 4 + leg); ctx.fillRect(18, 24, 5, 4 - leg);
  ctx.restore();
}

function drawGhost(ctx: CanvasRenderingContext2D, frame: number, flip: boolean, _state: string) {
  ctx.save();
  if (flip) { ctx.scale(-1, 1); ctx.translate(-32, 0); }
  const floatY = Math.sin(frame * 0.3) * 2;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(16, 30, 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(4, 10 + floatY, 24, 16);
  ctx.beginPath(); ctx.arc(16, 10 + floatY, 12, Math.PI, 0); ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(6 + i * 7, 26 + floatY, 3.5, 0, Math.PI); ctx.fill();
  }
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(9, 9 + floatY, 4, 5); ctx.fillRect(19, 9 + floatY, 4, 5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(10, 9 + floatY, 2, 2); ctx.fillRect(20, 9 + floatY, 2, 2);
  ctx.fillStyle = 'rgba(251,113,133,0.5)';
  ctx.fillRect(7, 14 + floatY, 4, 2); ctx.fillRect(21, 14 + floatY, 4, 2);
  ctx.fillStyle = '#0284c7'; ctx.fillRect(13, 16 + floatY, 6, 2);
  ctx.restore();
}

const DRAWERS = { cat: drawCat, dog: drawDog, dino: drawDino, ghost: drawGhost };
const PET_TYPES: Pet['type'][] = ['cat', 'dog', 'dino', 'ghost'];

function PetCanvas({ pet, size }: { pet: Pet; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 32, 32);
    ctx.imageSmoothingEnabled = false;
    DRAWERS[pet.type](ctx, pet.frame, pet.vx < 0, pet.state);
  });
  return (
    <canvas ref={canvasRef} width={32} height={32}
      style={{ imageRendering: 'pixelated', width: size, height: size }} />
  );
}

// ── STRIP HEIGHT — pets live in this zone ──────────────────────
const STRIP_HEIGHT = 72; // px — the dedicated bottom bar height

export default function VscodePets({ enabled }: { enabled: boolean }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [size, setSize] = useState(40);
  const [showControls, setShowControls] = useState(false);
  const petsRef = useRef<Pet[]>([]);
  const frameRef = useRef<number>();
  const tickRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setPets([]); petsRef.current = [];
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    const initial: Pet[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      type: PET_TYPES[Math.floor(Math.random() * PET_TYPES.length)],
      x: 120 + (window.innerWidth / 3) * i,
      y: 0, vy: 0,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.8),
      state: 'walk', frame: 0,
      stateTimer: 80 + Math.floor(Math.random() * 120),
      bubble: null, bubbleTimer: 0,
    }));
    petsRef.current = initial;
    setPets([...initial]);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const loop = () => {
      tickRef.current++;
      const W = window.innerWidth;
      petsRef.current = petsRef.current.map(p => {
        let { x, y, vx, vy, state, frame, stateTimer, bubble, bubbleTimer } = p;
        stateTimer--;
        if (stateTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.5) { state = 'walk'; vx = (Math.random() > 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.8); }
          else if (roll < 0.75) { state = 'idle'; vx = 0; }
          else { state = 'jump'; vy = -(3 + Math.random() * 2); }
          stateTimer = 80 + Math.floor(Math.random() * 180);
          if (Math.random() < 0.2) { bubble = BUBBLES[Math.floor(Math.random() * BUBBLES.length)]; bubbleTimer = 90; }
        }
        if (bubbleTimer > 0) bubbleTimer--; else bubble = null;
        if (state === 'jump' || y > 0) {
          vy += 0.25; y += vy;
          if (y >= 0) { y = 0; vy = 0; state = 'walk'; vx = (Math.random() > 0.5 ? 1 : -1) * 1.0; }
        }
        x += vx;
        if (x < 20) { x = 20; vx = Math.abs(vx); }
        if (x > W - 80) { x = W - 80; vx = -Math.abs(vx); }
        if (tickRef.current % 10 === 0) frame = (frame + 1) % 8;
        return { ...p, x, y, vx, vy, state, frame, stateTimer, bubble, bubbleTimer };
      });
      setPets([...petsRef.current]);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/*
        ✅ THE DEDICATED PET STRIP
        - position: fixed so it's always at the bottom of the VIEWPORT
        - zIndex: 9999 so it's above all page content
        - pointerEvents: none on the strip itself so it doesn't block clicks
        - individual pets re-enable pointerEvents so they're clickable
        - height = STRIP_HEIGHT, completely separate from the navbar
      */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: STRIP_HEIGHT,
        pointerEvents: 'none',
        zIndex: 9999,
        // subtle glassmorphism strip so pets have a visible "floor"
        background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)',
      }}>

        {/* ground line */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(232,84,10,0.25)',
          borderRadius: 2,
        }} />

        {/* ⚙️ size controls — bottom right corner of the strip */}
        <div style={{
          position: 'absolute',
          bottom: 18,
          right: 16,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10000,
        }}>
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(15,15,15,0.92)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 10,
                  padding: '6px 12px',
                  border: '1px solid rgba(232,84,10,0.35)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontFamily: 'Figtree', letterSpacing: 1 }}>SIZE</span>
                <input
                  type="range" min={24} max={72} value={size}
                  onChange={e => setSize(+e.target.value)}
                  style={{ width: 80, accentColor: '#E8540A', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'Figtree', minWidth: 28 }}>{size}px</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setShowControls(s => !s)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: `1px solid ${showControls ? '#E8540A' : 'rgba(232,84,10,0.35)'}`,
              background: showControls ? 'rgba(232,84,10,0.15)' : 'rgba(15,15,15,0.85)',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
            ⚙️
          </motion.button>
        </div>

        {/* pets walking on the ground line */}
        {pets.map(pet => (
          <div
            key={pet.id}
            style={{
              position: 'absolute',
              // ground line is at bottom:14, pet sits on top of it
              bottom: 16,
              left: pet.x,
              transform: `translateY(${-pet.y}px)`,
              pointerEvents: 'auto',
            }}>

            {/* speech bubble */}
            {pet.bubble && pet.bubbleTimer > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  bottom: size + 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  border: '2px solid #E8540A',
                  borderRadius: 8,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'Figtree',
                  whiteSpace: 'nowrap',
                  color: '#1a1a1a',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  zIndex: 1,
                }}>
                {pet.bubble}
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '6px solid #E8540A',
                }} />
              </motion.div>
            )}

            {/* clickable pet */}
            <motion.div
              whileHover={{ scale: 1.2 }}
              style={{ cursor: 'pointer' }}
              title="Click me!"
              onClick={() => {
                petsRef.current = petsRef.current.map(p =>
                  p.id === pet.id
                    ? { ...p, bubble: BUBBLES[Math.floor(Math.random() * BUBBLES.length)], bubbleTimer: 90, state: 'jump', vy: -4 }
                    : p
                );
              }}>
              <PetCanvas pet={pet} size={size} />
            </motion.div>
          </div>
        ))}
      </div>

      {/*
        ✅ BODY PADDING PUSHER
        Adds bottom padding to <body> equal to the strip height
        so the strip never covers page content!!
      */}
      <div style={{ height: STRIP_HEIGHT, flexShrink: 0, pointerEvents: 'none' }} />
    </>
  );
}
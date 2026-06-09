import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WORDS = ['SMARTER.', 'FASTER.', 'TOGETHER.', 'BETTER.'];

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [wordIndex, setWordIndex] = useState(0);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(smoothY, [0, 1], [-8, 8]);
  const rotateY = useTransform(smoothX, [0, 1], [-8, 8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
    className="auth-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        background: '#0D0500',
        display: 'flex',
        fontFamily: "'Figtree', 'DM Sans', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Noise texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,84,10,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 0.8, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'fixed', bottom: '-10%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,16,16,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* ===== LEFT PANEL ===== */}
      <motion.div
      className="auth-left"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          position: 'relative', zIndex: 2,
          borderRight: '1px solid rgba(232,84,10,0.15)',
          
        }}
        
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #E8540A, #6B1010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 0 30px rgba(232,84,10,0.4)',
            }}
          >
            🤖
          </motion.div>
          <span style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px',
            color: '#FFFFFF', fontFamily: "'Figtree', sans-serif",
          }}>
            Work<span style={{ color: '#E8540A' }}>Nest</span>
          </span>
        </div>

        {/* Giant headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 13, letterSpacing: 4, color: '#E8540A', fontWeight: 600, marginBottom: 20, textTransform: 'uppercase' }}
          >
            AI-Powered Platform
          </motion.p>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(52px, 7vw, 92px)',
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-3px',
                color: '#FFFFFF',
                margin: 0,
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              BUILD
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(52px, 7vw, 92px)',
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-3px',
                color: '#FFFFFF',
                margin: 0,
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              PROJECTS
            </motion.h1>
          </div>
          <div style={{ overflow: 'hidden', marginTop: 8 }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={wordIndex}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(52px, 7vw, 92px)',
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-3px',
                  margin: 0,
                  fontFamily: "'Figtree', sans-serif",
                  WebkitTextStroke: '2px #E8540A',
                  color: 'transparent',
                }}
              >
                {WORDS[wordIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginTop: 32, maxWidth: 380, lineHeight: 1.7 }}
          >
            The AI-powered workspace where teams move faster, think clearer, and ship with confidence.
          </motion.p>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}
          >
            {[
              { val: '10k+', label: 'Teams' },
              { val: '1M+', label: 'Tasks' },
              { val: '99%', label: 'Uptime' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.05, borderColor: '#E8540A' }}
                style={{
                  padding: '10px 20px', borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: '#E8540A' }}>{s.val}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ display: 'flex', gap: 24, alignItems: 'center' }}
        >
          {['Kanban', 'AI Assistant', 'Analytics', 'Real-time'].map((tag, i) => (
            <span key={tag} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>
              {i > 0 && <span style={{ marginRight: 24, color: '#E8540A' }}>✦</span>}
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ===== RIGHT PANEL — FORM ===== */}
      <motion.div
      className="auth-right"  
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{
          width: '42%', minWidth: 420, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 56px', position: 'relative', zIndex: 2,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mode tabs */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 40,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 4, background: 'rgba(255,255,255,0.03)',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: "'Figtree', sans-serif",
                  transition: 'all 0.25s ease',
                  background: mode === m ? '#E8540A' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: mode === m ? '0 4px 20px rgba(232,84,10,0.4)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <h2 style={{
                fontSize: 32, fontWeight: 800, color: '#FFFFFF',
                letterSpacing: '-1px', marginBottom: 6,
                fontFamily: "'Figtree', sans-serif",
              }}>
                {mode === 'login' ? 'Welcome back.' : 'Join the nest.'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, marginBottom: 36 }}>
                {mode === 'login' ? 'Sign in to your workspace' : 'Create your free account today'}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'register' && (
                  <InputField icon={<FiUser size={15} />} type="text" placeholder="Full name"
                    value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} required />
                )}
                <InputField icon={<FiMail size={15} />} type="email" placeholder="Email address"
                  value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} required />
                <InputField icon={<FiLock size={15} />} type={showPass ? 'text' : 'password'}
                  placeholder="Password" value={form.password}
                  onChange={v => setForm(p => ({ ...p, password: v }))} required
                  suffix={
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                      {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  }
                />

                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: -8 }}>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8540A', fontSize: 13, fontFamily: "'Figtree', sans-serif" }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{
                    marginTop: 8, padding: '16px 24px',
                    borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'rgba(232,84,10,0.5)' : 'linear-gradient(135deg, #E8540A 0%, #6B1010 100%)',
                    color: '#fff', fontSize: 15, fontWeight: 700,
                    fontFamily: "'Figtree', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(232,84,10,0.35)',
                    letterSpacing: '0.5px',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  {loading ? (
                    <span style={{
                      width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <FiArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8540A', fontWeight: 700, fontSize: 14, fontFamily: "'Figtree', sans-serif" }}>
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {[
              '🤖 Nesty AI generates tasks instantly',
              '⚡ Real-time team collaboration',
              '🏆 Gamified productivity streaks',
            ].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#E8540A', flexShrink: 0,
                  boxShadow: '0 0 8px rgba(232,84,10,0.8)',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{feat}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  * { box-sizing: border-box; }
  input::placeholder { color: rgba(255,255,255,0.2) !important; }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px #1A0500 inset !important;
    -webkit-text-fill-color: #fff !important;
  }

  @media (max-width: 768px) {
  .auth-container {
    flex-direction: column !important;
    overflow-y: auto !important;
    height: auto !important;
  }

    /* Show the left panel but make it compact */
    .auth-left {
      display: flex !important;
      width: 100% !important;
      min-height: unset !important;
      padding: 32px 24px 24px !important;
      border-right: none !important;
      border-bottom: 1px solid rgba(232,84,10,0.15) !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
      gap: 20px !important;
    }

    /* Hide the giant headline on mobile, keep logo + subtitle */
    .auth-left h1 {
      font-size: clamp(36px, 10vw, 52px) !important;
      letter-spacing: -2px !important;
    }

    /* Stat pills row — allow wrapping */
    .auth-left > div > div[style*="flexWrap"] {
      flex-wrap: wrap !important;
    }

    /* Hide the bottom feature tag strip — it's noise on mobile */
    .auth-left > div:last-child {
      display: none !important;
    }

    /* Right form panel */
    .auth-right {
      width: 100% !important;
      min-width: unset !important;
      padding: 32px 24px 48px !important;
    }
  }
`}</style>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, required, suffix }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{ borderColor: focused ? '#E8540A' : 'rgba(255,255,255,0.08)' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 12,
        border: `1px solid ${focused ? '#E8540A' : 'rgba(255,255,255,0.08)'}`,
        background: focused ? 'rgba(232,84,10,0.05)' : 'rgba(255,255,255,0.03)',
        transition: 'all 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(232,84,10,0.1)' : 'none',
      }}
    >
      <span style={{ color: focused ? '#E8540A' : 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'color 0.2s' }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: '#FFFFFF', fontSize: 14, fontFamily: "'Figtree', sans-serif",
        }}
      />
      {suffix}
    </motion.div>
  );
}
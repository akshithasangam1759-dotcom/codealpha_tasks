import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCamera, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const textPrimary = isDark ? '#fff' : '#2D1208';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,60,30,0.5)';
  const cardBg = isDark ? '#1A1A1A' : '#FFF0EB';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.2)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(196,133,106,0.08)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(196,133,106,0.25)';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name: form.name, bio: form.bio, avatar });
      toast.success('Profile updated!! 🎉');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
    toast.error('Please fill in all password fields!!');
    return;
  }
  if (passwords.newPass !== passwords.confirm) {
  toast.error('Passwords do not match!!');
  return;
}
    if (passwords.newPass.length < 6) {
      toast.error('Password must be 6+ characters');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/auth/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed!! 🔒');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch {
      toast.error('Current password is wrong');
    } finally {
      setSaving(false);
    }
  };

  const InputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: inputBg, border: `1px solid ${inputBorder}`,
    color: textPrimary, fontSize: 14, fontFamily: 'Figtree, sans-serif',
    outline: 'none', transition: 'all 0.2s',
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      <motion.h1
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 24, fontWeight: 900, color: textPrimary, letterSpacing: '-0.5px', margin: 0 }}>
        Settings ⚙️
      </motion.h1>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: textPrimary, marginBottom: 24 }}>Profile</h2>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: avatar ? 'transparent' : 'linear-gradient(135deg,#E8540A,#6B1010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#fff',
              overflow: 'hidden', boxShadow: '0 0 20px rgba(232,84,10,0.3)',
            }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : user?.name?.[0]?.toUpperCase() || 'U'
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: -6, right: -6,
                width: 26, height: 26, borderRadius: '50%',
                background: '#E8540A', border: '2px solid ' + cardBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}>
              <FiCamera size={12}/>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }}/>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: textPrimary }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: '#E8540A', marginTop: 4, fontWeight: 700 }}>
              Lv.{Math.floor((user?.xp || 0) / 1000) + 1} · {user?.xp || 0} XP
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Full Name</label>
            <input style={InputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              onFocus={e => e.target.style.borderColor = '#E8540A'}
              onBlur={e => e.target.style.borderColor = inputBorder}/>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Email</label>
            <input style={{ ...InputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={form.email} disabled/>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>Bio</label>
            <textarea style={{ ...InputStyle, resize: 'vertical', minHeight: 80 } as any}
              value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell your team something about yourself..."
              onFocus={e => e.target.style.borderColor = '#E8540A'}
              onBlur={e => e.target.style.borderColor = inputBorder}/>
          </div>
        </div>

        <motion.button onClick={handleSaveProfile} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 20, padding: '12px 24px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#E8540A,#6B1010)', color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(232,84,10,0.3)',
          }}>
          <FiSave size={15}/> {saving ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </motion.div>

      {/* Password Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: textPrimary, marginBottom: 24 }}>Change Password 🔒</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password', key: 'newPass' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: textMuted, display: 'block', marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...InputStyle, paddingRight: 40 }}
                  type={showPass ? 'text' : 'password'}
                  value={passwords[key as keyof typeof passwords]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = '#E8540A'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
                <button onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted }}>
                  {showPass ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>
            </div>
          ))}
        </div>

        <motion.button onClick={handleChangePassword} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 20, padding: '12px 24px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#E8540A,#6B1010)', color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: 'Figtree', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(232,84,10,0.3)',
          }}>
          <FiLock size={15}/> {saving ? 'Updating...' : 'Update Password'}
        </motion.button>
      </motion.div>

    </div>
  );
}
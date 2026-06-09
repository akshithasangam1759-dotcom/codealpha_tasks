// ============================================
// BUZZBEE - API CLIENT & UTILITIES
// ============================================

const API_BASE = window.location.origin + '/api';
let currentUser = null;
let authToken = null;
let socket = null;

// ---- Token Management ----
const getToken = () => localStorage.getItem('buzzbee_token');
const setToken = (t) => localStorage.setItem('buzzbee_token', t);
const clearToken = () => localStorage.removeItem('buzzbee_token');

// ---- API Client ----
const api = {
  async request(method, path, data = null, isFormData = false) {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (data) opts.body = isFormData ? data : JSON.stringify(data);

    // Abort after 10 seconds — stops browser tab from spinning forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    opts.signal = controller.signal;

    try {
      const res = await fetch(`${API_BASE}${path}`, opts);
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Request failed');
      return json;
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') throw new Error('Request timed out');
      throw e;
    }
  },
  get: (path) => api.request('GET', path),
  post: (path, data, isForm) => api.request('POST', path, data, isForm),
  put: (path, data, isForm) => api.request('PUT', path, data, isForm),
  delete: (path) => api.request('DELETE', path),
};

// ---- Toast Notifications ----
function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✅', error: '❌', info: '🐝' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Time Ago ----
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// ---- Format number ----
function formatNum(n) {
  if (!n) return 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

// ---- Avatar Placeholder ----
function getAvatarUrl(user) {
  if (!user) return '';
  if (user.avatar) return user.avatar;
  const initials = (user.displayName || user.username || '?')[0].toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=F5C518&color=0A0A0B&bold=true&size=128`;
}

// ---- Reaction Config ----
const REACTIONS = [
  { key: 'slay', emoji: '🔥', label: 'Slay' },
  { key: 'drip', emoji: '💧', label: 'Drip' },
  { key: 'vibe', emoji: '🎵', label: 'Vibe' },
  { key: 'w', emoji: '🏆', label: 'W' },
  { key: 'ate', emoji: '🍯', label: 'Ate' },
  { key: 'mood', emoji: '✨', label: 'Mood' },
  { key: 'fire', emoji: '🎧', label: 'Fire' },
];

function getTotalReactions(reactions) {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0);
}

function getUserReaction(reactions, userId) {
  if (!reactions || !userId) return null;
  for (const [key, arr] of Object.entries(reactions)) {
    if (arr && arr.some(id => id === userId || id._id === userId || id === userId?.toString())) return key;
  }
  return null;
}

// ---- Modal Helpers ----
function openModal(id) {
  document.getElementById(id)?.classList.add('show');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

// ---- Page Navigation ----
function navigateTo(page, opts = {}) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

  // Load page data
  pageLoaders[page]?.(opts);
}

// ---- Socket Init ----
function initSocket() {
  if (typeof io === 'undefined') return;
  socket = io(window.location.origin);

  socket.on('connect', () => {
    if (currentUser) socket.emit('join', currentUser._id);
  });

  socket.on('notification', (data) => {
    showToast(data.message, 'info');
    updateNotifBadge();
  });

  socket.on('user_online', ({ userId, online }) => {
    document.querySelectorAll(`[data-user-id="${userId}"] .conv-online-dot`).forEach(dot => {
      dot.className = `conv-online-dot ${online ? '' : 'offline'}`;
    });
  });

  socket.on('new_message', (msg) => {
    appendMessage(msg);
  });

  socket.on('user_typing', ({ username }) => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.querySelector('.typing-name') && (indicator.querySelector('.typing-name').textContent = username + ' is typing...');
      indicator.classList.add('show');
    }
  });

  socket.on('user_stop_typing', () => {
    document.getElementById('typing-indicator')?.classList.remove('show');
  });
}

// ---- Debounce ----
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ---- Format duration ----
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
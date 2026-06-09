// ============================================
// BUZZBEE - AUTH MODULE
// ============================================

// ---- Splash Screen ----
function initSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  // Generate floating music particles
  const particles = document.querySelector('.music-particles');
  if (particles) {
    const icons = ['🎵', '🎸', '🎤', '🎧', '🎹', '🎺', '🎻', '🥁', '🎼', '🎙️'];
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${5 + Math.random() * 10}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      p.style.fontSize = `${16 + Math.random() * 20}px`;
      particles.appendChild(p);
    }
  }

  setTimeout(() => {
    splash.style.animation = 'fadeOut 0.6s ease forwards';
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.05)';
    splash.style.transition = 'all 0.6s ease';
    setTimeout(() => {
      splash.style.display = 'none';
      checkAuth();
    }, 600);
  }, 2800);
}

// ---- Check Auth ----
async function checkAuth() {
  const token = getToken();
  if (!token) {
    showAuthPage();
    return;
  }
  try {
    const res = await api.get('/auth/me');
    if (res.success) {
      currentUser = res.user;
      authToken = token;
      applyUserTheme();
      showApp();
    } else {
      clearToken();
      showAuthPage();
    }
  } catch {
    clearToken();
    showAuthPage();
  }
}

function showAuthPage() {
  document.getElementById('auth-page').style.display = 'grid';
  document.getElementById('app').style.display = 'none';
  initAuthParticles();
}

function showApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  initApp();
}

// ---- Auth Particles ----
function initAuthParticles() {
  const container = document.querySelector('.music-particles.auth-particles');
  if (!container) return;
  const icons = ['🎵', '🎸', '🎤', '🎧', '🎹', '🎺', '🎻', '🥁', '🎼', '⭐', '✨', '💫'];
  container.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.fontSize = `${14 + Math.random() * 18}px`;
    container.appendChild(p);
  }
}

// ---- Auth Tabs ----
function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      document.getElementById(`${target}-form`)?.classList.remove('hidden');
    });
  });
}

// ---- Register ----
async function handleRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Creating account... 🐝';

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const displayName = document.getElementById('reg-displayname').value.trim();
  const role = document.querySelector('.role-option:checked')?.value || 'listener';

  if (!username || !email || !password) {
    showToast('Please fill in all required fields', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account 🐝';
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account 🐝';
    return;
  }

  try {
    const res = await api.post('/auth/register', { username, email, password, displayName, role });
    if (res.success) {
      setToken(res.token);
      currentUser = res.user;
      showToast(`Welcome to BuzzBee, ${res.user.displayName || res.user.username}! 🐝`, 'success');
      setTimeout(() => showApp(), 800);
    }
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account 🐝';
  }
}

// ---- Login ----
async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Signing in... 🎵';

  const emailOrUsername = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!emailOrUsername || !password) {
    showToast('Please enter your credentials', 'error');
    btn.disabled = false;
    btn.textContent = 'Sign In';
    return;
  }

  try {
    const res = await api.post('/auth/login', { emailOrUsername, password });
    if (res.success) {
      setToken(res.token);
      currentUser = res.user;
      applyUserTheme();
      showToast(`Welcome back, ${res.user.displayName || res.user.username}! 🐝`, 'success');
      setTimeout(() => showApp(), 600);
    }
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ---- Logout ----
async function handleLogout() {
  try { await api.post('/auth/logout'); } catch {}
  clearToken();
  currentUser = null;
  if (socket) socket.disconnect();
  document.getElementById('auth-page').style.display = 'grid';
  document.getElementById('app').style.display = 'none';
  showToast('Logged out. See you soon! 👋', 'info');
}

// ---- Password Toggle ----
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input?.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else if (input) {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });
}

// ---- Theme ----
function applyUserTheme() {
  const theme = currentUser?.theme || localStorage.getItem('buzzbee_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggle(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('buzzbee_theme', next);
  updateThemeToggle(next);
  if (currentUser) {
    api.put('/auth/profile', { theme: next }).catch(() => {});
    currentUser.theme = next;
  }
}

function updateThemeToggle(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function openForgotModal() {
  const modal = document.getElementById('forgot-modal');
  modal.style.display = 'flex';
  // Reset to step 1
  document.getElementById('fp-step1').style.display = 'block';
  document.getElementById('fp-step2').style.display = 'none';
  document.getElementById('fp-step3').style.display = 'none';
  document.getElementById('fp-error').style.display = 'none';
  document.getElementById('fp-email').value = '';
}
 
function closeForgotModal() {
  document.getElementById('forgot-modal').style.display = 'none';
}
 
async function sendResetCode() {
  const email = document.getElementById('fp-email').value.trim();
  const errEl = document.getElementById('fp-error');
  errEl.style.display = 'none';
 
  if (!email) { showFpError('Please enter your email'); return; }
 
  const btn = event.target;
  btn.textContent = 'Sending...';
  btn.disabled = true;
 
  try {
    await api.post('/auth/forgot-password', { email });
    document.getElementById('fp-step1').style.display = 'none';
    document.getElementById('fp-step2').style.display = 'block';
    showToast('Reset code sent to your email! 📧', 'success');
  } catch (err) {
    showFpError(err.message || 'Email not found');
    btn.textContent = 'Send Reset Code';
    btn.disabled = false;
  }
}
 
async function confirmReset() {
  const code = document.getElementById('fp-code').value.trim();
  const newPassword = document.getElementById('fp-newpass').value;
 
  if (!code || code.length !== 6) { showFpError('Enter the 6-digit code'); return; }
  if (!newPassword || newPassword.length < 6) { showFpError('Password must be at least 6 characters'); return; }
 
  const btn = event.target;
  btn.textContent = 'Resetting...';
  btn.disabled = true;
 
  try {
    await api.post('/auth/reset-password', { code, newPassword });
    document.getElementById('fp-step2').style.display = 'none';
    document.getElementById('fp-step3').style.display = 'block';
  } catch (err) {
    showFpError(err.message || 'Invalid or expired code');
    btn.textContent = 'Reset Password';
    btn.disabled = false;
  }
}
 
function showFpError(msg) {
  const el = document.getElementById('fp-error');
  el.textContent = msg;
  el.style.display = 'block';
}

// ============================================
// BUZZBEE - PROFILE MODULE
// ============================================

async function loadProfilePage(opts = {}) {
  const username = opts.username || currentUser?.username;
  if (!username) return;

  const container = document.getElementById('profile-content');
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">Loading profile...</div>`;

  try {
    const res = await api.get(`/users/${username}`);
    const { user, posts } = res;
    const isOwn = user._id === currentUser?._id;
    const isFollowing = currentUser?.following?.some(f => f._id === user._id || f === user._id);

    container.innerHTML = `
      <div style="margin-bottom:24px">
        ${user.coverImage ? `<img src="${user.coverImage}" class="profile-cover" alt="Cover">` :
          `<div class="profile-cover" style="background:linear-gradient(135deg, var(--bg-tertiary), var(--accent-glow))"></div>`}
      </div>
      <div class="profile-header">
        <div class="profile-avatar-wrap">
          <img src="${getAvatarUrl(user)}" class="profile-avatar" alt="${user.username}" onerror="this.src='${getAvatarUrl(user)}'">
          ${isOwn ? `<div class="profile-avatar-edit" onclick="document.getElementById('avatar-file-input').click()">✏️</div>` : ''}
        </div>
        <div class="profile-meta">
          <div class="profile-name">${user.displayName || user.username} ${user.isVerified ? '<span class="verified-badge text-gold">✓</span>' : ''}</div>
          <div class="profile-username">@${user.username}</div>
          ${user.bio ? `<div class="profile-bio">${escapeHtml(user.bio)}</div>` : ''}
          <div class="profile-role">${user.role || 'listener'}</div>
          ${user.moodTags?.length ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${user.moodTags.map(t => `<span style="font-size:12px;padding:3px 10px;background:var(--accent-glow);border-radius:100px;color:var(--accent-gold)">${t}</span>`).join('')}</div>` : ''}
        </div>
        <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:16px">
          <div class="profile-stats">
            <div class="profile-stat">
              <div class="profile-stat-num">${posts.length}</div>
              <div class="profile-stat-label">Posts</div>
            </div>
            <div class="profile-stat" onclick="showFollowList('followers', '${user._id}')">
              <div class="profile-stat-num">${formatNum(user.followers?.length || 0)}</div>
              <div class="profile-stat-label">Followers</div>
            </div>
            <div class="profile-stat" onclick="showFollowList('following', '${user._id}')">
              <div class="profile-stat-num">${formatNum(user.following?.length || 0)}</div>
              <div class="profile-stat-label">Following</div>
            </div>
          </div>
          <div class="profile-actions">
            ${isOwn ? `
              <button class="btn btn-ghost btn-sm" onclick="openEditProfileModal()">Edit Profile</button>
              <button class="btn btn-gold-outline btn-sm" onclick="navigateTo('avatar')">Avatar Studio</button>` :
              `<button class="btn ${isFollowing ? 'btn-ghost' : 'btn-primary'} btn-sm" id="profile-follow-btn" onclick="handleFollowUser('${user._id}', this)">${isFollowing ? 'Following' : 'Follow'}</button>
               <button class="btn btn-ghost btn-sm" onclick="startConversationWith('${user._id}')">💬 Message</button>`}
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="profile-tab active" onclick="showProfileTab('posts', this)">Posts</div>
        <div class="profile-tab" onclick="showProfileTab('saved', this)">Saved</div>
        ${user.favoriteTracks?.length ? `<div class="profile-tab" onclick="showProfileTab('music', this)">Music</div>` : ''}
      </div>

      <div id="profile-tab-content">
        ${renderProfilePostsGrid(posts)}
      </div>`;

    if (isOwn) {
      document.getElementById('edit-displayname').value = user.displayName || '';
      document.getElementById('edit-bio').value = user.bio || '';
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">😕</div><div class="empty-title">Profile not found</div></div>`;
  }
}

function renderProfilePostsGrid(posts) {
  if (!posts?.length) return `<div class="empty-state"><div class="empty-icon">📸</div><div class="empty-title">No posts yet</div></div>`;
  const withMedia = posts.filter(p => p.mediaUrl);
  if (!withMedia.length) return `<div style="display:flex;flex-direction:column;gap:16px">${posts.map(p => renderPost(p)).join('')}</div>`;
  return `<div class="profile-posts-grid">${withMedia.map(p => `
    <div class="profile-post-item" onclick="openPostModal('${p._id}')">
      <img src="${p.mediaUrl}" alt="Post" loading="lazy" onerror="this.parentElement.style.display='none'">
      <div class="profile-post-overlay">
        <span>${getTotalReactions(p.reactions)} 🔥</span>
        <span>${p.comments?.length || 0} 💬</span>
      </div>
    </div>`).join('')}</div>`;
}

async function showProfileTab(tab, el) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  el?.classList.add('active');
  const content = document.getElementById('profile-tab-content');
  if (!content) return;

  if (tab === 'posts') {
    const username = document.querySelector('.profile-username')?.textContent?.replace('@', '');
    if (username) {
      const res = await api.get(`/users/${username}`);
      content.innerHTML = renderProfilePostsGrid(res.posts);
    }
  } else if (tab === 'saved') {
    content.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px">Loading...</div>';
    try {
      const res = await api.get('/posts/saved');
      content.innerHTML = renderProfilePostsGrid(res.posts);
    } catch {}
  } else if (tab === 'music') {
    const favs = currentUser?.favoriteTracks || [];
    content.innerHTML = `<div class="tracks-grid">${favs.map(t => renderTrackCard({ ...t, artist_name: t.artist, album_image: t.albumArt, audio: t.previewUrl })).join('')}</div>`;
  }
}

async function handleFollowUser(userId, btn) {
  try {
    const res = await api.post(`/users/${userId}/follow`);
    if (res.following) {
      btn.textContent = 'Following';
      btn.className = 'btn btn-ghost btn-sm';
      if (!currentUser.following) currentUser.following = [];
      currentUser.following.push(userId);
    } else {
      btn.textContent = 'Follow';
      btn.className = 'btn btn-primary btn-sm';
      currentUser.following = currentUser.following?.filter(id => id !== userId && id._id !== userId);
    }
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditProfileModal() {
  // Populate fields with current user data
  const dn = document.getElementById('edit-displayname');
  const bio = document.getElementById('edit-bio');
  const bioCount = document.getElementById('bio-char-count');
  const avatarPreview = document.getElementById('edit-avatar-preview');

  if (dn) dn.value = currentUser?.displayName || '';
  if (bio) {
    bio.value = currentUser?.bio || '';
    if (bioCount) bioCount.textContent = `(${bio.value.length}/200)`;
  }
  if (avatarPreview) {
    avatarPreview.src = getAvatarUrl(currentUser);
    avatarPreview.onerror = () => { avatarPreview.src = getAvatarUrl(currentUser); };
  }

  // Set role radio
  const role = currentUser?.role || 'listener';
  const roleInput = document.getElementById(`edit-role-${role}`);
  if (roleInput) roleInput.checked = true;

  // Set mood tags
  const moodTags = currentUser?.moodTags || [];
  document.querySelectorAll('.mood-tag-check').forEach(cb => {
    cb.checked = moodTags.includes(cb.value);
  });

  // Reset file input
  const fileInput = document.getElementById('avatar-file-input');
  if (fileInput) fileInput.value = '';

  openModal('edit-profile-modal');
}

async function updateProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const formData = new FormData();
  formData.append('displayName', document.getElementById('edit-displayname').value.trim());
  formData.append('bio', document.getElementById('edit-bio').value.trim());

  // Role
  const selectedRole = document.querySelector('input[name="edit-role"]:checked');
  if (selectedRole) formData.append('role', selectedRole.value);

  // Mood tags
  const selectedMoods = [...document.querySelectorAll('.mood-tag-check:checked')].map(cb => cb.value);
  formData.append('moodTags', JSON.stringify(selectedMoods));

  // Avatar file
  const avatarFile = document.getElementById('avatar-file-input').files[0];
  if (avatarFile) formData.append('avatar', avatarFile);

  try {
    const res = await api.put('/auth/profile', formData, true);
    currentUser = { ...currentUser, ...res.user };
    updateSidebarUser();
    // Update sidebar avatar
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    if (sidebarAvatar) sidebarAvatar.src = getAvatarUrl(currentUser);
    // Update create post avatar
    const createPostAvatar = document.getElementById('create-post-avatar');
    if (createPostAvatar) createPostAvatar.src = getAvatarUrl(currentUser);
    closeModal('edit-profile-modal');
    showToast('Profile updated! ✨', 'success');
    loadProfilePage({ username: currentUser.username });
  } catch (err) {
    showToast(err.message || 'Failed to update profile', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes ✨';
  }
}

async function openPostModal(postId) {
  try {
    const res = await api.get(`/posts/${postId}`);
    const post = res.post;
    const modal = document.getElementById('post-detail-modal');
    const content = document.getElementById('post-detail-content');
    if (content) content.innerHTML = renderPost(post);
    if (modal) { modal.classList.add('show'); attachPostHandlers(); }
  } catch {}
}

// ============================================
// SVG AVATAR BUILDER — Snapchat/Bitmoji Style
// REPLACE everything between the two
// "SVG AVATAR BUILDER" comment blocks in app.js
// ============================================

const SKIN_TONES_LIST  = ['#FFECD2','#F5CFA0','#E8B88A','#C68642','#8D5524','#4A2510'];
const HAIR_COLORS_LIST = ['#1A1110','#3D2B1F','#7C4A1E','#B8860B','#D4A574','#E8D5B7','#FF6B9D','#7C3AED'];
const EYE_COLORS_LIST  = ['#3D2B1F','#2D6A4F','#1A3A5C','#7C6319','#5C2D6B','#1A5C3A'];
const OUTFIT_COLORS_LIST = ['#F5C518','#FF6B9D','#7C3AED','#2D6A4F','#1A3A5C','#E63946','#F0F0F0','#1A1A1A'];
const BG_GRADIENTS = [
  ['#1A1A2E','#16213E'],['#0D1B2A','#1B2838'],['#1A0A2E','#2D1B4E'],
  ['#0A2E1A','#1B4E2D'],['#2E1A0A','#4E2D1B'],['#2E0A1A','#4E1B2D'],
  ['#F0EDE8','#DDD8D0'],['#0A0A0F','#111118']
];

// --- HAIR SHAPES (proper Bitmoji-style rounded shapes) ---
const HAIR_SHAPES = {
  Short: (c) => `
    <ellipse cx="100" cy="78" rx="54" ry="32" fill="${c}"/>
    <rect x="46" y="78" width="108" height="18" fill="${c}"/>`,

  Long: (c) => `
    <ellipse cx="100" cy="74" rx="56" ry="34" fill="${c}"/>
    <rect x="44" y="78" width="14" height="90" rx="7" fill="${c}"/>
    <rect x="142" y="78" width="14" height="90" rx="7" fill="${c}"/>`,

  Afro: (c) => `
    <circle cx="100" cy="72" r="58" fill="${c}"/>
    <circle cx="54"  cy="82" r="28" fill="${c}"/>
    <circle cx="146" cy="82" r="28" fill="${c}"/>
    <circle cx="72"  cy="56" r="22" fill="${c}"/>
    <circle cx="128" cy="56" r="22" fill="${c}"/>`,

  Curly: (c) => `
    <ellipse cx="100" cy="72" rx="54" ry="30" fill="${c}"/>
    <circle cx="56"  cy="78" r="14" fill="${c}"/>
    <circle cx="144" cy="78" r="14" fill="${c}"/>
    <circle cx="66"  cy="62" r="12" fill="${c}"/>
    <circle cx="134" cy="62" r="12" fill="${c}"/>
    <circle cx="80"  cy="56" r="11" fill="${c}"/>
    <circle cx="120" cy="56" r="11" fill="${c}"/>
    <circle cx="100" cy="52" r="13" fill="${c}"/>`,

  Bun: (c) => `
    <ellipse cx="100" cy="80" rx="50" ry="24" fill="${c}"/>
    <circle cx="100" cy="52" r="24" fill="${c}"/>
    <circle cx="100" cy="52" r="16" fill="${c}" opacity="0.7"/>`,

  Spiky: (c) => `
    <ellipse cx="100" cy="82" rx="50" ry="24" fill="${c}"/>
    <polygon points="66,78 72,44 80,78"  fill="${c}"/>
    <polygon points="82,76 90,36 98,76"  fill="${c}"/>
    <polygon points="102,76 110,36 118,76" fill="${c}"/>
    <polygon points="120,78 128,44 134,78" fill="${c}"/>`,

  Ponytail: (c) => `
    <ellipse cx="100" cy="78" rx="52" ry="28" fill="${c}"/>
    <ellipse cx="154" cy="95" rx="12" ry="34" fill="${c}" transform="rotate(20,154,95)"/>`,

  Buzz: (c) => `
    <ellipse cx="100" cy="82" rx="50" ry="22" fill="${c}" opacity="0.85"/>`,
};
const HAIR_KEYS = ['Short','Long','Afro','Curly','Bun','Spiky','Ponytail','Buzz'];

// --- EYE SHAPES ---
const EYE_SHAPES = {
  Normal: (c) => `
    <ellipse cx="80" cy="122" rx="11" ry="10" fill="white"/>
    <circle  cx="80" cy="122" r="6"  fill="${c}"/>
    <circle  cx="80" cy="122" r="3"  fill="#111"/>
    <circle  cx="82" cy="120" r="1.8" fill="white"/>
    <ellipse cx="120" cy="122" rx="11" ry="10" fill="white"/>
    <circle  cx="120" cy="122" r="6"  fill="${c}"/>
    <circle  cx="120" cy="122" r="3"  fill="#111"/>
    <circle  cx="122" cy="120" r="1.8" fill="white"/>`,

  Happy: (c) => `
    <path d="M70,122 Q80,113 90,122" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M110,122 Q120,113 130,122" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

  Big: (c) => `
    <ellipse cx="80" cy="122" rx="14" ry="13" fill="white"/>
    <circle  cx="80" cy="122" r="9"  fill="${c}"/>
    <circle  cx="80" cy="122" r="4.5" fill="#0A0A0F"/>
    <circle  cx="83" cy="118" r="3"  fill="white"/>
    <ellipse cx="120" cy="122" rx="14" ry="13" fill="white"/>
    <circle  cx="120" cy="122" r="9"  fill="${c}"/>
    <circle  cx="120" cy="122" r="4.5" fill="#0A0A0F"/>
    <circle  cx="123" cy="118" r="3"  fill="white"/>`,

  Cool: (c) => `
    <ellipse cx="80"  cy="124" rx="11" ry="7" fill="white"/>
    <circle  cx="80"  cy="124" r="4.5" fill="${c}"/>
    <circle  cx="80"  cy="124" r="2"  fill="#111"/>
    <ellipse cx="120" cy="124" rx="11" ry="7" fill="white"/>
    <circle  cx="120" cy="124" r="4.5" fill="${c}"/>
    <circle  cx="120" cy="124" r="2"  fill="#111"/>`,

  Wink: (c) => `
    <ellipse cx="80" cy="122" rx="11" ry="10" fill="white"/>
    <circle  cx="80" cy="122" r="6"  fill="${c}"/>
    <circle  cx="80" cy="122" r="3"  fill="#111"/>
    <circle  cx="82" cy="120" r="1.8" fill="white"/>
    <path d="M110,122 Q120,115 130,122" stroke="#555" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

  Stars: (c) => `
    <text x="66"  y="130" font-size="20" fill="${c}" text-anchor="middle">✦</text>
    <text x="134" y="130" font-size="20" fill="${c}" text-anchor="middle">✦</text>`,
};
const EYE_KEYS = ['Normal','Happy','Big','Cool','Wink','Stars'];

// --- BROW SHAPES ---
const BROW_SHAPES = {
  Arched: (hc) => `
    <path d="M69,108 Q80,101 91,105"  stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M109,105 Q120,101 131,108" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>`,
  Flat: (hc) => `
    <line x1="69" y1="106" x2="91"  y2="106" stroke="${hc}" stroke-width="3.5" stroke-linecap="round" opacity="0.9"/>
    <line x1="109" y1="106" x2="131" y2="106" stroke="${hc}" stroke-width="3.5" stroke-linecap="round" opacity="0.9"/>`,
  Raised: (hc) => `
    <path d="M69,110 Q80,100 91,107"  stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M109,107 Q120,100 131,110" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>`,
};
const BROW_KEYS = ['Arched','Flat','Raised'];

// --- MOUTH SHAPES ---
const MOUTH_SHAPES = {
  Smile: () => `<path d="M84,153 Q100,166 116,153" stroke="#C0635B" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  Grin:  () => `<path d="M82,151 Q100,168 118,151" fill="#FF9494" stroke="#C0635B" stroke-width="2"/>
                <path d="M89,153 Q100,158 111,153" fill="white"/>`,
  Smirk: () => `<path d="M88,154 Q102,162 116,150" stroke="#C0635B" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  Pout:  () => `<ellipse cx="100" cy="156" rx="14" ry="8" fill="#FF9494" stroke="#C0635B" stroke-width="2"/>`,
  Surprised: () => `<ellipse cx="100" cy="156" rx="9" ry="12" fill="#FF9494" stroke="#C0635B" stroke-width="2.5"/>`,
  Straight:  () => `<line x1="88" y1="154" x2="112" y2="154" stroke="#C0635B" stroke-width="3" stroke-linecap="round"/>`,
};
const MOUTH_KEYS = ['Smile','Grin','Smirk','Pout','Surprised','Straight'];

// --- OUTFIT SHAPES ---
function darkenInline(hex) {
  try {
    let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    r=Math.max(0,r-30); g=Math.max(0,g-30); b=Math.max(0,b-30);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  } catch(e){return hex;}
}
const OUTFIT_KEYS = ['Tee','Hoodie','Tank','Jacket','Dress','Streetwear'];
const OUTFIT_SHAPES = {
  Tee: (c, sk) => `
    <path d="M48,222 L62,190 Q100,182 138,190 L152,222 L148,300 L52,300 Z" fill="${c}"/>
    <path d="M62,190 L34,212 L28,252 L48,255 L56,218 Z" fill="${c}"/>
    <path d="M138,190 L166,212 L172,252 L152,255 L144,218 Z" fill="${c}"/>
    <ellipse cx="36" cy="257" rx="11" ry="13" fill="${sk}"/>
    <ellipse cx="164" cy="257" rx="11" ry="13" fill="${sk}"/>`,

  Hoodie: (c, sk) => `
    <path d="M46,226 L60,188 Q100,178 140,188 L154,226 L150,300 L50,300 Z" fill="${c}"/>
    <path d="M74,182 Q100,176 126,182 L122,196 Q100,190 78,196 Z" fill="${darkenInline(c)}"/>
    <rect x="82" y="238" width="36" height="22" rx="6" fill="${darkenInline(c)}"/>
    <path d="M60,188 L30,212 L24,254 L46,257 L54,216 Z" fill="${c}"/>
    <path d="M140,188 L170,212 L176,254 L154,257 L146,216 Z" fill="${c}"/>
    <rect x="22" y="250" width="26" height="9" rx="4" fill="${darkenInline(c)}"/>
    <rect x="152" y="250" width="26" height="9" rx="4" fill="${darkenInline(c)}"/>
    <ellipse cx="35" cy="261" rx="12" ry="13" fill="${sk}"/>
    <ellipse cx="165" cy="261" rx="12" ry="13" fill="${sk}"/>`,

  Tank: (c, sk) => `
    <path d="M66,224 L74,192 Q100,184 126,192 L134,224 L130,300 L70,300 Z" fill="${c}"/>
    <path d="M74,192 L66,197 L62,215 L70,219 Z" fill="${c}"/>
    <path d="M126,192 L134,197 L138,215 L130,219 Z" fill="${c}"/>
    <path d="M66,200 L38,220 L32,258 L52,261 L60,226 Z" fill="${sk}"/>
    <path d="M134,200 L162,220 L168,258 L148,261 L140,226 Z" fill="${sk}"/>
    <ellipse cx="40" cy="263" rx="11" ry="12" fill="${sk}"/>
    <ellipse cx="160" cy="263" rx="11" ry="12" fill="${sk}"/>`,

  Jacket: (c, sk) => `
    <path d="M46,224 L60,188 Q100,180 140,188 L154,224 L150,300 L50,300 Z" fill="${c}"/>
    <path d="M100,188 L88,222 L100,230 L112,222 Z" fill="${darkenInline(c)}" opacity="0.55"/>
    <rect x="82" y="204" width="16" height="20" rx="4" fill="rgba(255,255,255,0.1)"/>
    <path d="M60,188 L28,212 L22,254 L44,257 L52,218 Z" fill="${c}"/>
    <path d="M140,188 L172,212 L178,254 L156,257 L148,218 Z" fill="${c}"/>
    <rect x="20" y="250" width="26" height="9" rx="4" fill="${darkenInline(c)}"/>
    <rect x="154" y="250" width="26" height="9" rx="4" fill="${darkenInline(c)}"/>
    <ellipse cx="33" cy="261" rx="11" ry="13" fill="${sk}"/>
    <ellipse cx="167" cy="261" rx="11" ry="13" fill="${sk}"/>`,

  Dress: (c, sk) => `
    <path d="M68,222 Q72,190 100,186 Q128,190 132,222 Z" fill="${c}"/>
    <path d="M58,222 Q68,224 100,226 Q132,224 142,222 Q150,264 156,300 L44,300 Q50,264 58,222 Z" fill="${c}"/>
    <path d="M80,186 L72,198 L76,212 L83,204 Z" fill="${c}"/>
    <path d="M120,186 L128,198 L124,212 L117,204 Z" fill="${c}"/>
    <path d="M72,200 L44,220 L38,258 L58,261 L64,226 Z" fill="${sk}"/>
    <path d="M128,200 L156,220 L162,258 L142,261 L136,226 Z" fill="${sk}"/>
    <ellipse cx="40" cy="263" rx="11" ry="12" fill="${sk}"/>
    <ellipse cx="160" cy="263" rx="11" ry="12" fill="${sk}"/>`,

  Streetwear: (c, sk) => `
    <path d="M44,228 L58,186 Q100,176 142,186 L156,228 L152,300 L48,300 Z" fill="${c}"/>
    <rect x="72" y="202" width="56" height="26" rx="5" fill="rgba(255,255,255,0.12)"/>
    <text x="100" y="220" text-anchor="middle" font-size="11" font-weight="900" fill="rgba(255,255,255,0.8)" font-family="Arial">VIBE</text>
    <path d="M58,186 L26,212 L20,256 L42,259 L52,216 Z" fill="${c}"/>
    <path d="M142,186 L174,212 L180,256 L158,259 L148,216 Z" fill="${c}"/>
    <rect x="18" y="252" width="26" height="9" rx="4" fill="rgba(255,255,255,0.18)"/>
    <rect x="156" y="252" width="26" height="9" rx="4" fill="rgba(255,255,255,0.18)"/>
    <ellipse cx="31" cy="263" rx="12" ry="13" fill="${sk}"/>
    <ellipse cx="169" cy="263" rx="12" ry="13" fill="${sk}"/>`,
};


// --- ACCESSORIES ---
const ACC_SHAPES = {
  None: () => '',
  Sunglasses: () => `
    <rect x="65" y="116" width="28" height="15" rx="7" fill="#111" opacity="0.92"/>
    <rect x="107" y="116" width="28" height="15" rx="7" fill="#111" opacity="0.92"/>
    <line x1="93" y1="123" x2="107" y2="123" stroke="#111" stroke-width="3.5"/>
    <line x1="60" y1="120" x2="65" y2="122" stroke="#111" stroke-width="2.5"/>
    <line x1="135" y1="122" x2="140" y2="120" stroke="#111" stroke-width="2.5"/>`,

  RoundGlasses: () => `
    <circle cx="80"  cy="122" r="13" fill="none" stroke="#B8860B" stroke-width="2.5"/>
    <circle cx="120" cy="122" r="13" fill="none" stroke="#B8860B" stroke-width="2.5"/>
    <line x1="93"  y1="122" x2="107" y2="122" stroke="#B8860B" stroke-width="2"/>
    <line x1="60"  y1="119" x2="67"  y2="121" stroke="#B8860B" stroke-width="2"/>
    <line x1="133" y1="121" x2="140" y2="119" stroke="#B8860B" stroke-width="2"/>`,

  Headphones: () => `
    <path d="M50,110 Q50,68 100,68 Q150,68 150,110" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="42"  y="106" width="18" height="26" rx="9" fill="#F5C518"/>
    <rect x="140" y="106" width="18" height="26" rx="9" fill="#F5C518"/>`,

  Crown: () => `
    <polygon points="64,84 74,58 86,76 100,52 114,76 126,58 136,84" fill="#F5C518" stroke="#D4A017" stroke-width="1.5"/>
    <circle cx="74"  cy="62" r="4.5" fill="#FF6B9D"/>
    <circle cx="100" cy="54" r="5.5" fill="#7C3AED"/>
    <circle cx="126" cy="62" r="4.5" fill="#FF6B9D"/>`,

  Beanie: () => `
    <ellipse cx="100" cy="82" rx="55" ry="28" fill="#F5C518"/>
    <rect x="45"  y="82" width="110" height="18" rx="4" fill="#D4A017"/>
    <circle cx="100" cy="56" r="10" fill="#F5C518"/>`,

  MusicNotes: () => `
    <text x="148" y="98"  font-size="16" fill="#F5C518" opacity="0.9">♪</text>
    <text x="157" y="76"  font-size="11" fill="#FF6B9D" opacity="0.7">♫</text>
    <text x="36"  y="90"  font-size="13" fill="#7C3AED" opacity="0.8">♩</text>
    <text x="24"  y="112" font-size="9"  fill="#F5C518" opacity="0.5">♬</text>`,

  Chain: () => `
    <path d="M68,192 Q100,204 132,192" stroke="#D4A017" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="200" r="7" fill="#F5C518" stroke="#D4A017" stroke-width="2"/>
    <circle cx="100" cy="200" r="3" fill="#D4A017"/>`,
};
const ACC_KEYS = ['None','Sunglasses','RoundGlasses','Headphones','Crown','Beanie','MusicNotes','Chain'];
const ACC_LABELS = ['None','Sunnies','Glasses','Headphones','Crown','Beanie','Notes','Chain'];

// Inline darken helper (used inside template literals)
function darkenInline(hex) {
  try {
    let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    r=Math.max(0,r-30); g=Math.max(0,g-30); b=Math.max(0,b-30);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  } catch(e){return hex;}
}

let avatarConfig = {
  skinTone:1, hairStyle:0, hairColor:0, eyeStyle:0, eyeColor:0,
  browStyle:0, mouthStyle:0, outfitStyle:0, outfitColor:0, accessory:0, bgColor:0
};

function initAvatarBuilder() {
  if (currentUser?.avatarConfig && typeof currentUser.avatarConfig.skinTone === 'number') {
    avatarConfig = { ...avatarConfig, ...currentUser.avatarConfig };
  }
  buildAvatarTabs();
  showAvatarTab('skin', document.querySelector('.avatar-tab'));
  updateAvatarPreview();
}

function buildAvatarTabs() {
  const tabs = document.getElementById('avatar-tabs');
  if (!tabs) return;
  const defs = [
    ['skin','🎨','Skin'],['hair','✂️','Hair'],['eyes','👀','Eyes'],
    ['brows','🤨','Brows'],['mouth','😊','Mouth'],['outfit','👔','Outfit'],
    ['extras','💍','Extras'],['bg','🌈','BG']
  ];
  tabs.innerHTML = defs.map((t,i) =>
    `<div class="avatar-tab ${i===0?'active':''}" onclick="showAvatarTab('${t[0]}',this)">
      ${t[1]} ${t[2]}
    </div>`
  ).join('');
}

function showAvatarTab(type, el) {
  document.querySelectorAll('.avatar-tab').forEach(t => t.classList.remove('active'));
  el?.classList.add('active');
  const panel = document.getElementById('avatar-options-panel');
  if (!panel) return;

  const swatch = (colors, key, size=36) =>
    `<div class="color-swatch-grid">${colors.map((c,i) =>
      `<div class="color-swatch ${avatarConfig[key]===i?'selected':''}"
        style="background:${c};width:${size}px;height:${size}px"
        onclick="setAP('${key}',${i},this)"></div>`
    ).join('')}</div>`;

  const optGrid = (keys, labels, key, cols=4, previews=null) =>
    `<div class="avatar-option-grid" style="grid-template-columns:repeat(${cols},1fr);gap:8px">
      ${keys.map((k,i) => `
        <div class="avatar-option ${avatarConfig[key]===i?'selected':''}" onclick="setAP('${key}',${i},this)">
          ${previews ? `<div class="avatar-option-preview">${previews[i]}</div>` : ''}
          <span>${labels?labels[i]:k}</span>
        </div>`
      ).join('')}
    </div>`;

  const label = (txt) => `<div class="avatar-section-label">${txt}</div>`;

  if (type === 'skin') {
    panel.innerHTML = label('Skin Tone') + swatch(SKIN_TONES_LIST, 'skinTone', 42);

  } else if (type === 'hair') {
    panel.innerHTML =
      label('Hair Color') + swatch(HAIR_COLORS_LIST, 'hairColor') +
      label('Style') + optGrid(HAIR_KEYS, HAIR_KEYS, 'hairStyle');

  } else if (type === 'eyes') {
    panel.innerHTML =
      label('Eye Color') + swatch(EYE_COLORS_LIST, 'eyeColor') +
      label('Style') + optGrid(EYE_KEYS, EYE_KEYS, 'eyeStyle', 3);

  } else if (type === 'brows') {
    panel.innerHTML =
      label('Eyebrow Style') + optGrid(BROW_KEYS, BROW_KEYS, 'browStyle', 3);

  } else if (type === 'mouth') {
    panel.innerHTML =
      label('Mouth Style') + optGrid(MOUTH_KEYS, MOUTH_KEYS, 'mouthStyle', 3);

  } else if (type === 'outfit') {
    panel.innerHTML =
      label('Color') + swatch(OUTFIT_COLORS_LIST, 'outfitColor') +
      label('Style') + optGrid(OUTFIT_KEYS, OUTFIT_KEYS, 'outfitStyle', 3);

  } else if (type === 'extras') {
    panel.innerHTML =
      label('Accessory') + optGrid(ACC_KEYS, ACC_LABELS, 'accessory');

  } else if (type === 'bg') {
    panel.innerHTML = label('Background') +
      `<div class="color-swatch-grid">${BG_GRADIENTS.map((g,i) =>
        `<div class="color-swatch ${avatarConfig.bgColor===i?'selected':''}"
          style="background:linear-gradient(135deg,${g[0]},${g[1]});width:42px;height:42px;border-radius:10px"
          onclick="setAP('bgColor',${i},this)"></div>`
      ).join('')}</div>`;
  }
}

function setAP(key, value, el) {
  avatarConfig[key] = value;
  el.closest('.avatar-option-grid,.color-swatch-grid')
    ?.querySelectorAll('.avatar-option,.color-swatch')
    .forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  updateAvatarPreview();
}

function hexToHSL(hex) {
  let r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
    h/=6;
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}

function adjustColor(hex, lDelta) {
  try {
    const {h,s,l} = hexToHSL(hex);
    const nl = Math.max(0, Math.min(100, l + lDelta));
    // Convert back HSL→hex
    const hDecimal = h/360, sDecimal = s/100, lDecimal = nl/100;
    const hue2rgb = (p,q,t) => { if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    let r,g,b;
    if(sDecimal===0){r=g=b=lDecimal;}else{
      const q=lDecimal<0.5?lDecimal*(1+sDecimal):lDecimal+sDecimal-lDecimal*sDecimal;
      const p=2*lDecimal-q;
      r=hue2rgb(p,q,hDecimal+1/3); g=hue2rgb(p,q,hDecimal); b=hue2rgb(p,q,hDecimal-1/3);
    }
    return `#${Math.round(r*255).toString(16).padStart(2,'0')}${Math.round(g*255).toString(16).padStart(2,'0')}${Math.round(b*255).toString(16).padStart(2,'0')}`;
  } catch(e){return hex;}
}

function generateAvatarSVG(cfg) {
  cfg = cfg || avatarConfig;
  const skin    = SKIN_TONES_LIST[cfg.skinTone]      || SKIN_TONES_LIST[1];
  const hColor  = HAIR_COLORS_LIST[cfg.hairColor]    || '#1A1110';
  const eColor  = EYE_COLORS_LIST[cfg.eyeColor]      || '#3D2B1F';
  const oColor  = OUTFIT_COLORS_LIST[cfg.outfitColor]|| '#F5C518';
  const bg      = BG_GRADIENTS[cfg.bgColor]          || BG_GRADIENTS[0];

  const skinLight   = adjustColor(skin, +12);
  const skinShadow  = adjustColor(skin, -14);
  const skinBlush   = adjustColor(skin, -6);

  const hairSVG   = (HAIR_SHAPES[HAIR_KEYS[cfg.hairStyle]]  || HAIR_SHAPES.Short)(hColor);
  const eyeSVG    = (EYE_SHAPES[EYE_KEYS[cfg.eyeStyle]]     || EYE_SHAPES.Normal)(eColor);
  const browSVG   = (BROW_SHAPES[BROW_KEYS[cfg.browStyle||0]] || BROW_SHAPES.Arched)(hColor);
  const mouthSVG  = (MOUTH_SHAPES[MOUTH_KEYS[cfg.mouthStyle]]|| MOUTH_SHAPES.Smile)();
  const outfitSVG = (OUTFIT_SHAPES[OUTFIT_KEYS[cfg.outfitStyle]]||OUTFIT_SHAPES.Tee)(oColor, skin);
  const accSVG    = (ACC_SHAPES[ACC_KEYS[cfg.accessory]]     || ACC_SHAPES.None)();

  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${adjustColor(bg[0], 15)}"/>
      <stop offset="100%" stop-color="${bg[1]}"/>
    </radialGradient>
    <radialGradient id="skinGrad" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${skinLight}"/>
      <stop offset="100%" stop-color="${skinShadow}"/>
    </radialGradient>
    <radialGradient id="skinGrad2" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${skin}"/>
      <stop offset="100%" stop-color="${skinShadow}"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.28)"/>
    </filter>
    <filter id="subtleShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="200" height="300" fill="url(#bgGrad)"/>
  <!-- Subtle background glow -->
  <ellipse cx="100" cy="120" rx="80" ry="80" fill="${bg[0]}" opacity="0.3"/>

  <!-- Ground shadow -->
  <ellipse cx="100" cy="298" rx="64" ry="6" fill="rgba(0,0,0,0.22)"/>

  <!-- Outfit (behind neck/body) -->
  <g filter="url(#softShadow)">${outfitSVG}</g>

  <!-- Neck -->
  <rect x="88" y="166" width="24" height="30" rx="10" fill="url(#skinGrad2)"/>

  <!-- Back hair layer -->
  <g opacity="0.95">${hairSVG}</g>

  <!-- Head -->
  <ellipse cx="100" cy="118" rx="53" ry="56" fill="url(#skinGrad)" filter="url(#softShadow)"/>

  <!-- Ears -->
  <ellipse cx="47"  cy="122" rx="9" ry="12" fill="url(#skinGrad2)"/>
  <ellipse cx="153" cy="122" rx="9" ry="12" fill="url(#skinGrad2)"/>
  <!-- Ear inner -->
  <ellipse cx="47"  cy="122" rx="5" ry="7" fill="${skinShadow}" opacity="0.4"/>
  <ellipse cx="153" cy="122" rx="5" ry="7" fill="${skinShadow}" opacity="0.4"/>

  <!-- Eyebrows -->
  ${browSVG}

  <!-- Eyes -->
  ${eyeSVG}

  <!-- Nose (subtle) -->
  <path d="M97,130 Q94,144 98,148 Q100,150 102,148 Q106,144 103,130"
    stroke="${skinShadow}" stroke-width="1.8" fill="none" opacity="0.35" stroke-linecap="round"/>

  <!-- Mouth -->
  ${mouthSVG}

  <!-- Blush -->
  <ellipse cx="68"  cy="138" rx="13" ry="8" fill="#FF9494" opacity="0.16"/>
  <ellipse cx="132" cy="138" rx="13" ry="8" fill="#FF9494" opacity="0.16"/>

  <!-- Front hair layer (covers top of face) -->
  <g opacity="0.97">${hairSVG}</g>
  <!-- Hair inner shine -->
  <ellipse cx="86" cy="74" rx="18" ry="7" fill="white" opacity="0.07" transform="rotate(-15,86,74)"/>

  <!-- Accessory -->
  ${accSVG}
</svg>`;
}

function updateAvatarPreview() {
  const display = document.getElementById('avatar-display');
  if (!display) return;
  display.innerHTML = generateAvatarSVG();
}

async function saveAvatar() {
  const btn = document.querySelector('[onclick="saveAvatar()"]');
  if (btn) { btn.textContent = 'Saving... ⏳'; btn.disabled = true; }
  try {
    await api.put('/auth/avatar', { avatarConfig });
    currentUser.avatarConfig = { ...avatarConfig };
    updateSidebarUser();
    showToast('Avatar saved! Looking fire 🔥', 'success');
  } catch (err) {
    showToast(err.message || 'Save failed', 'error');
  } finally {
    if (btn) { btn.textContent = 'Save Avatar 💾'; btn.disabled = false; }
  }
}

// Helper: get avatar URL (SVG data URI for custom avatars, fallback to ui-avatars)
function getAvatarUrl(user) {
  if (!user) return 'https://ui-avatars.com/api/?name=U&background=F5C518&color=0A0A0B';
  if (user.avatar) return user.avatar; // uploaded image
  if (user.avatarConfig) {
    // Generate small SVG and return as data URI for use in <img> tags
    try {
      const svg = generateAvatarSVG(user.avatarConfig);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } catch(e) {}
  }
  const name = encodeURIComponent(user.displayName || user.username || 'U');
  return `https://ui-avatars.com/api/?name=${name}&background=F5C518&color=0A0A0B&bold=true`;
}
// ============================================
// VIBEY AI
// ============================================

let vibeyHistory = [];

function toggleVibeyChat() {
  const popup = document.getElementById('vibey-popup');
  popup?.classList.toggle('show');
  if (popup?.classList.contains('show') && vibeyHistory.length === 0) {
    addVibeyMessage("hey bestie!! 🐝✨ i'm Vibey, your music AI! what are you vibing with today?", 'bot');
  }
}

function addVibeyMessage(text, role) {
  const messages = document.getElementById('vibey-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = `vibey-msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  vibeyHistory.push({ role, content: text });
}

async function sendVibeyMessage() {
  const input = document.getElementById('vibey-input');
  const text = input?.value?.trim();
  if (!text) return;
  input.value = '';

  addVibeyMessage(text, 'user');

  const typing = document.getElementById('vibey-typing');
  typing?.classList.add('show');

  try {
    const res = await api.post('/vibey/chat', {
      message: text,
      history: vibeyHistory.slice(-10).map(h => ({ role: h.role === 'bot' ? 'assistant' : 'user', content: h.content })),
    });
    typing?.classList.remove('show');
    addVibeyMessage(res.reply, 'bot');
  } catch {
    typing?.classList.remove('show');
    addVibeyMessage("oops my brain glitched! 😅 try again bestie", 'bot');
  }
}

function handleVibeyKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendVibeyMessage(); }
}

// ============================================
// SEARCH
// ============================================

const debouncedSearch = debounce(async (query) => {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  if (!query) { dropdown.classList.remove('show'); return; }
  try {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    dropdown.innerHTML = res.users.slice(0, 6).map(u => `
      <div class="search-result-item" onclick="navigateTo('profile', {username: '${u.username}'});document.getElementById('search-dropdown').classList.remove('show')">
        <img src="${getAvatarUrl(u)}" class="search-result-avatar" alt="" onerror="this.src='${getAvatarUrl(u)}'">
        <div class="search-result-info">
          <div class="search-result-name">${u.displayName || u.username}</div>
          <div class="search-result-role">${u.role}</div>
        </div>
        ${u.isOnline ? '<span class="online-indicator"></span>' : ''}
      </div>`).join('') || `<div style="padding:16px;text-align:center;color:var(--text-muted)">No users found</div>`;
    dropdown.classList.add('show');
  } catch {}
}, 400);

// ============================================
// SIDEBAR & NAV
// ============================================

function updateSidebarUser() {
  const name = document.getElementById('sidebar-username');
  const role = document.getElementById('sidebar-role');
  const avatar = document.getElementById('sidebar-user-avatar');
  if (name) name.textContent = currentUser?.displayName || currentUser?.username || '';
  if (role) role.textContent = currentUser?.role || 'listener';
  if (avatar) { avatar.src = getAvatarUrl(currentUser); avatar.onerror = () => { avatar.src = getAvatarUrl(currentUser); }; }
}

// ============================================
// SETTINGS
// ============================================

function loadSettingsPage() {
  document.getElementById('settings-username-val').textContent = currentUser?.username || '';
  document.getElementById('settings-email-val').textContent = currentUser?.email || '';
  document.getElementById('settings-role-val').textContent = currentUser?.role || '';
}

// ============================================
// PAGE LOADERS MAP
// ============================================

const pageLoaders = {
  home: () => { /* handled by override in index.html */ },
  explore: () => loadExplorePage(),
  music: () => loadMusicPage(),
  stories: () => loadStories(),
  messages: () => loadConversations(),
  notifications: () => { loadNotifications(); },
  vibey: () => {},
  avatar: () => initAvatarBuilder(),
  profile: (opts) => loadProfilePage(opts),
  settings: () => loadSettingsPage(),
};

// ============================================
// MAIN APP INIT
// ============================================

function initApp() {
  updateSidebarUser();
  applyUserTheme();

  // Default to home
  navigateTo('home');

  // Defer socket + polling so page loads instantly
  setTimeout(() => {
    initSocket();
    updateNotifBadge();
    initInfiniteScroll();
  }, 500);

  // Poll notifications every 2 minutes (not 1)
  setInterval(updateNotifBadge, 120000);
}

// ============================================
// CURSOR GLOW
// ============================================

function initCursorGlow() {
  const cursor = document.getElementById('cursor-glow');
  if (!cursor) return;
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
  const animate = () => {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animate);
  };
  animate();
}

// ============================================
// GLOBAL INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initAuthTabs();
  initPasswordToggles();
  initPlayer();
  initCursorGlow();
  applyUserTheme();

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.topbar-search')) {
      document.getElementById('search-dropdown')?.classList.remove('show');
    }
    if (!e.target.closest('.notif-btn-wrap')) {
      document.getElementById('notif-dropdown')?.classList.remove('show');
    }
  });
});
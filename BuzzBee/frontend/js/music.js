// ============================================
// BUZZBEE - MUSIC PLAYER MODULE
// ============================================

let currentTrack = null;
let audioPlayer = null;
let isPlaying = false;
let progressInterval = null;

function initPlayer() {
  audioPlayer = new Audio();
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', () => { isPlaying = false; updatePlayBtn(); });
  audioPlayer.addEventListener('loadedmetadata', () => {
    document.getElementById('player-duration').textContent = formatDuration(audioPlayer.duration);
  });
}

function playTrack(track) {
  if (!track || !track.previewUrl) { showToast('No preview available for this track', 'info'); return; }

  currentTrack = track;
  audioPlayer.src = track.previewUrl;
  audioPlayer.play().then(() => {
    isPlaying = true;
    updatePlayerUI();
    updatePlayBtn();
    showMiniPlayer();
    // Log recently played
    api.post('/users/me/recently-played', { track }).catch(() => {});
  }).catch(err => {
    showToast('Playback failed. Try another track.', 'error');
    console.error(err);
  });
}

function togglePlay() {
  if (!currentTrack) return;
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
  } else {
    audioPlayer.play();
    isPlaying = true;
  }
  updatePlayBtn();
  const art = document.querySelector('.mini-player-art');
  if (art) art.classList.toggle('playing', isPlaying);
}

function updatePlayBtn() {
  const btn = document.getElementById('player-play-btn');
  if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
}

function updatePlayerUI() {
  if (!currentTrack) return;
  const art = document.getElementById('player-art');
  const track = document.getElementById('player-track');
  const artist = document.getElementById('player-artist');
  if (art) { art.src = currentTrack.albumArt || ''; art.classList.toggle('playing', isPlaying); }
  if (track) track.textContent = currentTrack.name || 'Unknown';
  if (artist) artist.textContent = currentTrack.artist || '';
}

function updateProgress() {
  if (!audioPlayer) return;
  const { currentTime, duration } = audioPlayer;
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const fill = document.getElementById('progress-fill');
  const current = document.getElementById('player-current');
  if (fill) fill.style.width = `${pct}%`;
  if (current) current.textContent = formatDuration(currentTime);
}

function seekTrack(e) {
  if (!audioPlayer || !audioPlayer.duration) return;
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = pct * audioPlayer.duration;
}

function showMiniPlayer() {
  document.getElementById('mini-player')?.classList.add('show');
  updatePlayerUI();
}

function hideMiniPlayer() {
  audioPlayer?.pause();
  isPlaying = false;
  document.getElementById('mini-player')?.classList.remove('show');
}

function adjustVolume(val) {
  if (audioPlayer) audioPlayer.volume = val;
}

// ============================================
// MUSIC PAGE
// ============================================

let currentGenre = null;
let musicPage = 1;
let musicLoading = false;

// ---- Direct Jamendo browser calls (no backend proxy needed) ----
const JAMENDO = 'https://api.jamendo.com/v3.0';
const JID = '1d3a5c19'; 

async function jamendoGet(endpoint, params = {}) {
  const p = new URLSearchParams({ client_id: JID, format: 'json', audioformat: 'mp32', imagesize: 300, ...params });
  const res = await fetch(`${JAMENDO}${endpoint}?${p}`);
  if (!res.ok) throw new Error('Jamendo error');
  return res.json();
}

async function loadMusicPage() {
  loadGenres();
  setTimeout(() => loadTrendingTracksJamendo(), 150);
  setTimeout(() => loadTrendingArtistsJamendo(), 400);
}

async function loadGenres() {
  const grid = document.getElementById('genres-grid');
  if (!grid) return;
  try {
    const res = await api.get('/music/genres');
    grid.innerHTML = res.genres.map(g => `
      <div class="genre-card" onclick="filterByGenre('${g.id}', this)" style="border-top: 3px solid ${g.color}">
        <div class="genre-icon">${g.icon}</div>
        <div class="genre-name">${g.name}</div>
      </div>`).join('');
  } catch {}
}

async function filterByGenre(genre, el) {
  document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('active'));
  el?.classList.add('active');
  currentGenre = genre === currentGenre ? null : genre;
  loadTrendingTracks(true);
}

async function loadTrendingTracks(reset = false) {
  return loadTrendingTracksJamendo(reset);
}

async function loadTrendingTracksJamendo(reset = false) {
  const grid = document.getElementById('tracks-grid');
  if (!grid || musicLoading) return;
  if (reset) musicPage = 1;
  musicLoading = true;

  if (musicPage === 1) grid.innerHTML = renderTrackSkeletons(8);

  try {
    const params = { limit: 16, offset: (musicPage - 1) * 16, order: 'popularity_total' };
    if (currentGenre) params.tags = currentGenre;
    const data = await jamendoGet('/tracks/', params);

    if (musicPage === 1) grid.innerHTML = '';

    if (!data.results || data.results.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-title">No tracks found</div><div class="empty-sub">Try a different genre</div></div>`;
    } else {
      data.results.forEach(t => grid.insertAdjacentHTML('beforeend', renderTrackCard(t)));
      musicPage++;
    }
  } catch (err) {
    console.error('Jamendo error:', err);
    if (musicPage === 1) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-title">Music unavailable</div><div class="empty-sub">Check your Jamendo Client ID in music.js</div></div>`;
  }
  musicLoading = false;
}

function renderTrackCard(track) {
  const albumArt = track.album_image || track.image || '';
  const isFav = currentUser?.favoriteTracks?.some(t => t.id === track.id);
  const trackObj = {
    id: track.id, name: track.name, artist: track.artist_name,
    album: track.album_name, albumArt, previewUrl: track.audio || track.audiodownload,
    duration: track.duration,
  };
  const trackJson = JSON.stringify(trackObj).replace(/"/g, '&quot;');
  return `
    <div class="track-card">
      <div style="position:relative">
        <img src="${albumArt}" class="track-card-art" alt="${track.name}" onerror="this.src=''">
        <div class="track-card-overlay">
          <div class="track-card-play" onclick='playTrack(${trackJson})'>▶</div>
        </div>
      </div>
      <div class="track-card-info">
        <div class="track-card-name">${track.name}</div>
        <div class="track-card-artist">${track.artist_name}</div>
      </div>
      <div class="track-card-actions">
        <span style="font-size:12px;color:var(--text-muted)">${formatDuration(track.duration)}</span>
        <button class="track-card-favorite ${isFav ? 'favorited' : ''}" onclick='toggleFavoriteTrack(${trackJson}, this)' title="Favorite">♥</button>
      </div>
    </div>`;
}

function renderTrackSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="track-card">
      <div class="skeleton" style="width:100%;aspect-ratio:1;border-radius:12px 12px 0 0"></div>
      <div style="padding:12px">
        <div class="skeleton skeleton-line medium" style="margin-bottom:6px"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>`).join('');
}

async function toggleFavoriteTrack(track, btn) {
  try {
    const res = await api.post('/users/me/favorites', { track });
    btn.classList.toggle('favorited', res.isFavorite);
    showToast(res.isFavorite ? '♥ Added to favorites' : 'Removed from favorites', 'success');
  } catch {}
}

async function loadTrendingArtists() {
  return loadTrendingArtistsJamendo();
}

async function loadTrendingArtistsJamendo() {
  const grid = document.getElementById('artists-grid');
  if (!grid) return;
  grid.innerHTML = renderTrackSkeletons(6);
  try {
    const data = await jamendoGet('/artists/', { limit: 12, order: 'popularity_total' });
    if (!data.results || !data.results.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = data.results.map(a => `
      <div class="track-card" style="cursor:pointer" onclick="loadArtistTracksModal('${a.id}', '${(a.name||'').replace(/'/g,'')}')">
        <img src="${a.image || ''}" class="track-card-art" alt="${a.name}" style="aspect-ratio:1;object-fit:cover" onerror="this.style.background='var(--bg-tertiary)'">
        <div class="track-card-info">
          <div class="track-card-name">${a.name}</div>
          <div class="track-card-artist">${a.joindate ? 'Since ' + a.joindate.split('-')[0] : 'Independent Artist'}</div>
        </div>
      </div>`).join('');
  } catch (e) { console.error(e); grid.innerHTML = ''; }
}

async function loadArtistTracksModal(artistId, artistName) {
  const grid = document.getElementById('tracks-grid');
  if (!grid) return;
  grid.innerHTML = renderTrackSkeletons(4);
  document.querySelector('.section-title') && (document.querySelector('.section-title').textContent = `🎤 ${artistName}`);
  try {
    const data = await jamendoGet('/tracks/', { artist_id: artistId, limit: 12, order: 'popularity_artist' });
    grid.innerHTML = data.results.length ? data.results.map(renderTrackCard).join('') :
      `<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-title">No tracks found for ${artistName}</div></div>`;
  } catch { grid.innerHTML = ''; }
}

async function searchMusic(query) {
  if (!query) { loadTrendingTracksJamendo(true); return; }
  const grid = document.getElementById('tracks-grid');
  if (!grid) return;
  grid.innerHTML = renderTrackSkeletons(4);
  try {
    const data = await jamendoGet('/tracks/', { search: query, limit: 20, order: 'popularity_total' });
    grid.innerHTML = data.results && data.results.length ? data.results.map(renderTrackCard).join('') :
      `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No tracks found for "${query}"</div></div>`;
  } catch { grid.innerHTML = ''; }
}

// ============================================
// EXPLORE PAGE
// ============================================

async function loadExplorePage() {
  loadExploreUsers();
  loadExplorePosts();
}

async function loadExploreUsers() {
  const grid = document.getElementById('trending-users-grid');
  if (!grid) return;
  try {
    const res = await api.get('/users/trending');
    grid.innerHTML = res.users.map(u => `
      <div class="suggested-user" style="padding:12px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:12px">
        <img src="${getAvatarUrl(u)}" class="suggested-avatar" alt="${u.username}" onclick="navigateTo('profile', {username: '${u.username}'})" onerror="this.src='${getAvatarUrl(u)}'">
        <div class="suggested-info">
          <div class="suggested-name" onclick="navigateTo('profile', {username: '${u.username}'})">${u.displayName || u.username}</div>
          <div class="suggested-role">${u.followersCount || 0} followers</div>
        </div>
        <button class="follow-btn not-following" data-user-id="${u._id}" onclick="handleFollowUser('${u._id}', this)">Follow</button>
      </div>`).join('');
  } catch {}
}

async function loadExplorePosts(type = 'all') {
  const grid = document.getElementById('explore-posts-grid');
  if (!grid) return;
  grid.innerHTML = '';
  try {
    const res = await api.get(`/posts/explore?limit=18&type=${type}`);
    res.posts.forEach(post => {
      if (!post.mediaUrl) return;
      grid.insertAdjacentHTML('beforeend', `
        <div class="explore-item" onclick="openPostModal('${post._id}')">
          <img src="${post.mediaUrl}" alt="Post" loading="lazy" onerror="this.parentElement.remove()">
          <div class="explore-item-overlay">
            <span>${getTotalReactions(post.reactions)} 🔥</span>
            <span>${post.comments?.length || 0} 💬</span>
          </div>
        </div>`);
    });
    if (!grid.children.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📷</div><div class="empty-title">Nothing to explore yet</div></div>`;
    }
  } catch {}
}

// ============================================
// MESSAGES MODULE
// ============================================

let currentConversation = null;
let typingTimeout = null;

async function loadConversations() {
  const list = document.getElementById('conversations-list-items');
  if (!list) return;
  try {
    const res = await api.get('/messages/conversations');
    list.innerHTML = res.conversations.map(conv => {
      const other = conv.participants.find(p => p._id !== currentUser?._id);
      if (!other) return '';
      return `
        <div class="conversation-item" onclick="openConversation('${conv._id}', ${JSON.stringify(other).replace(/"/g, '&quot;')})" data-conv-id="${conv._id}">
          <div class="conv-avatar-wrap" data-user-id="${other._id}">
            <img src="${getAvatarUrl(other)}" class="conv-avatar" alt="${other.username}" onerror="this.src='${getAvatarUrl(other)}'">
            <div class="conv-online-dot ${other.isOnline ? '' : 'offline'}"></div>
          </div>
          <div class="conv-info">
            <div class="conv-name">${other.displayName || other.username}</div>
            <div class="conv-last-msg">${conv.lastMessage?.text || 'Start chatting!'}</div>
          </div>
          <div class="conv-meta">
            <div class="conv-time">${conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}</div>
          </div>
        </div>`;
    }).join('') || `<div class="empty-state" style="padding:40px 20px"><div class="empty-icon">💬</div><div class="empty-title">No conversations</div><div class="empty-sub">Search for users to start chatting</div></div>`;
  } catch {}
}

async function openConversation(conversationId, user) {
  currentConversation = { id: conversationId, user };

  // Update chat header
  document.getElementById('chat-header-name').textContent = user.displayName || user.username;
  document.getElementById('chat-header-status').textContent = user.isOnline ? '● Online' : 'Last seen ' + timeAgo(user.lastSeen);
  document.getElementById('chat-header-status').className = `chat-header-status ${user.isOnline ? 'online' : ''}`;
  const headerAvatar = document.getElementById('chat-header-avatar');
  if (headerAvatar) { headerAvatar.src = getAvatarUrl(user); }

  // Show chat area
  document.getElementById('chat-placeholder').style.display = 'none';
  document.getElementById('chat-active').style.display = 'flex';

  // Join socket room
  socket?.emit('join_conversation', conversationId);

  // Load messages
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = '';
  try {
    const res = await api.get(`/messages/${conversationId}`);
    res.messages.forEach(msg => appendMessage(msg));
    msgs.scrollTop = msgs.scrollHeight;
  } catch {}

  // Mark active conversation
  document.querySelectorAll('.conversation-item').forEach(el => {
    el.classList.toggle('active', el.dataset.convId === conversationId);
  });

  // Focus input
  document.getElementById('chat-input')?.focus();
}

function appendMessage(msg) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs || !msg) return;

  const isOwn = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
  const div = document.createElement('div');
  div.className = 'message-group';
  div.id = `msg-${msg._id}`;
  div.innerHTML = `
    <div class="message-bubble ${isOwn ? 'sent' : 'received'}" style="${msg.isDeleted ? 'opacity:0.5;font-style:italic' : ''}">
      ${msg.mediaUrl ? `<img src="${msg.mediaUrl}" style="max-width:200px;border-radius:8px;margin-bottom:4px;display:block" alt="Image">` : ''}
      ${msg.text || ''}
    </div>
    <div class="message-meta ${isOwn ? 'sent' : ''}">${timeAgo(msg.createdAt)}${isOwn && msg.seenBy?.length > 1 ? ' · Seen' : ''}</div>`;

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text || !currentConversation) return;

  input.value = '';
  socket?.emit('stop_typing', { conversationId: currentConversation.id });

  try {
    await api.post(`/messages/${currentConversation.id}`, { text });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleChatTyping() {
  if (!currentConversation || !socket) return;
  socket.emit('typing', { conversationId: currentConversation.id, userId: currentUser._id, username: currentUser.username });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket?.emit('stop_typing', { conversationId: currentConversation.id });
  }, 2000);
}

async function startConversationWith(userId) {
  try {
    const res = await api.get(`/messages/conversations/${userId}/open`);
    navigateTo('messages');
    setTimeout(() => {
      const other = res.conversation.participants.find(p => p._id !== currentUser._id);
      openConversation(res.conversation._id, other);
    }, 300);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================
// NOTIFICATIONS MODULE
// ============================================

async function loadNotifications() {
  const list = document.getElementById('notifications-list');
  if (!list) return;
  list.innerHTML = renderSkeletons(3);
  try {
    const res = await api.get('/notifications');
    list.innerHTML = res.notifications.length ? res.notifications.map(n => `
      <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="handleNotifClick('${n._id}', '${n.type}', '${n.post?._id || ''}')">
        <img src="${getAvatarUrl(n.sender)}" class="notif-avatar" alt="" onerror="this.src='${getAvatarUrl(n.sender)}'">
        <div class="notif-info">
          <div class="notif-text"><strong>${n.sender?.displayName || n.sender?.username}</strong> ${getNotifText(n)}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.isRead ? '<div class="notif-unread-dot"></div>' : ''}
      </div>`).join('') :
      `<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">No notifications</div></div>`;
    await api.put('/notifications/read');
    updateNotifBadge(0);
  } catch {}
}

function getNotifText(n) {
  const types = {
    reaction: `reacted ${n.reactionType ? '(' + n.reactionType + ')' : ''} to your post`,
    comment: 'commented on your post',
    follow: 'started following you',
    story_reaction: 'reacted to your story',
    message: 'sent you a message',
    mention: 'mentioned you',
  };
  return types[n.type] || n.message || '';
}

async function updateNotifBadge(count) {
  if (count === undefined) {
    try { const res = await api.get('/notifications/unread-count'); count = res.count; } catch { return; }
  }
  const badge = document.getElementById('notif-badge');
  const topBadge = document.getElementById('topbar-notif-badge');
  const navBadge = document.getElementById('nav-notif-badge');
  [badge, topBadge, navBadge].forEach(el => {
    if (!el) return;
    el.textContent = count > 9 ? '9+' : count;
    el.classList.toggle('show', count > 0);
  });
}

function handleNotifClick(id, type, postId) {
  if (type === 'message') navigateTo('messages');
  else if (postId) openPostModal(postId);
  else if (type === 'follow') navigateTo('profile', { username: currentUser.username });
}

async function loadNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('show');
  if (!dropdown.classList.contains('show')) return;

  const list = dropdown.querySelector('.notif-dropdown-list');
  if (list) list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted)">Loading...</div>`;

  try {
    const res = await api.get('/notifications');
    if (list) list.innerHTML = res.notifications.slice(0, 8).map(n => `
      <div class="notification-item ${n.isRead ? '' : 'unread'}" style="padding:12px 16px">
        <img src="${getAvatarUrl(n.sender)}" class="notif-avatar" alt="" style="width:36px;height:36px" onerror="this.src='${getAvatarUrl(n.sender)}'">
        <div class="notif-info">
          <div class="notif-text" style="font-size:13px"><strong>${n.sender?.displayName || n.sender?.username}</strong> ${getNotifText(n)}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join('') || `<div style="padding:20px;text-align:center;color:var(--text-muted)">No notifications</div>`;
    api.put('/notifications/read').catch(() => {});
    updateNotifBadge(0);
  } catch {}
}
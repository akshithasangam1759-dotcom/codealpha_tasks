// ============================================
// BUZZBEE - FEED & POSTS MODULE
// ============================================

let feedPage = 1;
let feedLoading = false;
let feedHasMore = true;

// ---- Load Feed ----
async function loadFeed(reset = false) {
  if (feedLoading) return;
  if (reset) { feedPage = 1; feedHasMore = true; }
  if (!feedHasMore) return;

  feedLoading = true;
  const container = document.getElementById('feed-posts');
  if (!container) return;

  if (feedPage === 1) {
    container.innerHTML = renderSkeletons(3);
  }

  try {
    const res = await api.get(`/posts/feed?page=${feedPage}&limit=10`);
    if (feedPage === 1) container.innerHTML = '';

    if (res.posts.length === 0 && feedPage === 1) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <div class="empty-title">Your feed is quiet</div>
          <div class="empty-sub">Follow some artists and creators to see their posts here</div>
          <button class="btn btn-primary" style="margin-top:16px;width:auto;padding:12px 24px" onclick="navigateTo('explore')">Explore Artists</button>
        </div>`;
    } else {
      res.posts.forEach(post => {
        container.insertAdjacentHTML('beforeend', renderPost(post));
      });
      attachPostHandlers();
      feedPage++;
      feedHasMore = feedPage <= res.totalPages;
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">😬</div><div class="empty-title">Couldn't load feed</div><div class="empty-sub">${err.message}</div></div>`;
  }
  feedLoading = false;
}

// ---- Render Post ----
function renderPost(post) {
  const author = post.author || {};
  const userId = currentUser?._id;
  const userReaction = getUserReaction(post.reactions, userId);
  const totalReactions = getTotalReactions(post.reactions);
  const isSaved = currentUser?.savedPosts?.includes(post._id);
  const avatarUrl = getAvatarUrl(author);

  let mediaHtml = '';
  if (post.mediaUrl && post.mediaType === 'image') {
    mediaHtml = `<img src="${post.mediaUrl}" alt="Post image" class="post-media" loading="lazy" onclick="openImageModal('${post.mediaUrl}')">`;
  } else if (post.mediaUrl && post.mediaType === 'video') {
    mediaHtml = `<video src="${post.mediaUrl}" class="post-media" controls preload="metadata"></video>`;
  }

  let musicHtml = '';
  if (post.musicTrack?.id) {
    musicHtml = `
      <div class="post-music-track" onclick="playTrack(${JSON.stringify(post.musicTrack).replace(/"/g, '&quot;')})">
        <img src="${post.musicTrack.albumArt || ''}" class="post-music-album-art" onerror="this.src=''" alt="Album art">
        <div class="post-music-info">
          <div class="post-music-name">${post.musicTrack.name || 'Unknown Track'}</div>
          <div class="post-music-artist">${post.musicTrack.artist || 'Unknown Artist'}</div>
        </div>
        <div class="equalizer">
          <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        </div>
        <div class="post-music-play">▶</div>
      </div>`;
  }

  const reactionsHtml = REACTIONS.slice(0, 5).map(r => {
    const count = post.reactions?.[r.key]?.length || 0;
    const active = userReaction === r.key ? 'reacted' : '';
    return `<button class="reaction-btn ${active}" data-post-id="${post._id}" data-reaction="${r.key}" title="${r.label}">
      ${r.emoji} ${count > 0 ? `<span>${formatNum(count)}</span>` : ''}
    </button>`;
  }).join('');

  const commentsHtml = (post.comments || []).slice(-2).map(c => `
    <div class="comment-item">
      <img src="${getAvatarUrl(c.user)}" class="comment-item-avatar" alt="Avatar" onerror="this.src='${getAvatarUrl(c.user)}'">
      <div class="comment-bubble">
        <div class="comment-author" onclick="navigateTo('profile', {username: '${c.user?.username}'})">${c.user?.displayName || c.user?.username || 'User'}</div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
        <div class="comment-time">${timeAgo(c.createdAt)}</div>
      </div>
    </div>`).join('');

  const showComments = post.comments?.length > 0;

  return `
  <article class="post-card" id="post-${post._id}" data-post-id="${post._id}">
    <div class="post-card-header">
      <img src="${avatarUrl}" class="post-author-avatar" alt="${author.username}" onclick="navigateTo('profile', {username: '${author.username}'})" onerror="this.src='${getAvatarUrl(author)}'">
      <div class="post-author-info">
        <div class="post-author-name" onclick="navigateTo('profile', {username: '${author.username}'})">${author.displayName || author.username} ${author.isVerified ? '<span class="verified-badge">✓</span>' : ''}</div>
        <div class="post-author-meta">
          <span>@${author.username}</span> · <span>${timeAgo(post.createdAt)}</span>
          ${post.type !== 'text' ? `· <span class="text-gold">${post.type}</span>` : ''}
        </div>
      </div>
      ${author._id === userId ? `<button class="post-options-btn" onclick="handlePostOptions('${post._id}')">⋯</button>` : ''}
    </div>

    ${post.caption ? `<div class="post-caption">${formatCaption(post.caption)}</div>` : ''}
    ${mediaHtml}
    ${musicHtml}

    <div class="post-reactions-row">
      <div class="reactions-left">${reactionsHtml}</div>
      <div class="reactions-right">
        <button class="post-action-btn" onclick="toggleCommentBox('${post._id}')">💬 <span>${formatNum(post.comments?.length)}</span></button>
        <button class="post-action-btn ${isSaved ? 'saved' : ''}" data-save-btn="${post._id}" onclick="handleSavePost('${post._id}', this)">
          ${isSaved ? '🔖' : '📌'}
        </button>
      </div>
    </div>

    ${showComments ? `<div class="post-comments" id="comments-${post._id}" style="display:none">
      <div class="comment-input-row">
        <img src="${getAvatarUrl(currentUser)}" class="comment-avatar" alt="You">
        <input class="comment-input" placeholder="Add a comment..." id="comment-input-${post._id}" onkeydown="handleCommentKeydown(event, '${post._id}')">
        <button class="comment-send-btn" onclick="submitComment('${post._id}')">➤</button>
      </div>
      <div id="comments-list-${post._id}">${commentsHtml}</div>
      ${post.comments?.length > 2 ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;cursor:pointer" onclick="loadAllComments('${post._id}')">View all ${post.comments.length} comments</div>` : ''}
    </div>` : `<div class="post-comments" id="comments-${post._id}" style="display:none">
      <div class="comment-input-row">
        <img src="${getAvatarUrl(currentUser)}" class="comment-avatar" alt="You">
        <input class="comment-input" placeholder="Add a comment..." id="comment-input-${post._id}" onkeydown="handleCommentKeydown(event, '${post._id}')">
        <button class="comment-send-btn" onclick="submitComment('${post._id}')">➤</button>
      </div>
      <div id="comments-list-${post._id}"></div>
    </div>`}
  </article>`;
}

function formatCaption(text) {
  return escapeHtml(text)
    .replace(/#(\w+)/g, '<span class="tag" onclick="searchTag(\'$1\')">#$1</span>')
    .replace(/@(\w+)/g, '<span class="tag" onclick="navigateTo(\'profile\', {username: \'$1\'})" >@$1</span>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- Post Handlers ----
function attachPostHandlers() {
  document.querySelectorAll('.reaction-btn[data-post-id]').forEach(btn => {
    btn.removeEventListener('click', handleReactionClick);
    btn.addEventListener('click', handleReactionClick);
  });
}

async function handleReactionClick(e) {
  const btn = e.currentTarget;
  const postId = btn.dataset.postId;
  const reaction = btn.dataset.reaction;
  if (!postId || !reaction) return;

  try {
    const res = await api.post(`/posts/${postId}/react`, { reactionType: reaction });
    // Update UI in post card
    const card = document.getElementById(`post-${postId}`);
    if (!card) return;
    // Refresh reactions for this post
    const reactionBtns = card.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(b => {
      b.classList.remove('reacted');
      if (res.reacted && b.dataset.reaction === res.reactionType) b.classList.add('reacted');
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function toggleCommentBox(postId) {
  const box = document.getElementById(`comments-${postId}`);
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden) document.getElementById(`comment-input-${postId}`)?.focus();
}

function handleCommentKeydown(e, postId) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitComment(postId);
  }
}

async function submitComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input?.value?.trim();
  if (!text) return;

  try {
    const res = await api.post(`/posts/${postId}/comments`, { text });
    input.value = '';
    const list = document.getElementById(`comments-list-${postId}`);
    if (list) {
      list.insertAdjacentHTML('beforeend', `
        <div class="comment-item">
          <img src="${getAvatarUrl(currentUser)}" class="comment-item-avatar" alt="You">
          <div class="comment-bubble">
            <div class="comment-author">${currentUser.displayName || currentUser.username}</div>
            <div class="comment-text">${escapeHtml(text)}</div>
            <div class="comment-time">just now</div>
          </div>
        </div>`);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSavePost(postId, btn) {
  try {
    const res = await api.post(`/posts/${postId}/save`);
    btn.classList.toggle('saved', res.saved);
    btn.textContent = res.saved ? '🔖' : '📌';
    showToast(res.saved ? 'Post saved!' : 'Post removed from saved', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handlePostOptions(postId) {
  if (confirm('Delete this post?')) {
    try {
      await api.delete(`/posts/${postId}`);
      document.getElementById(`post-${postId}`)?.remove();
      showToast('Post deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

// ---- Skeletons ----
function renderSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-post">
      <div class="d-flex align-center gap-12" style="margin-bottom:12px">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-line medium" style="margin-bottom:6px"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </div>
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-line medium"></div>
    </div>`).join('');
}

// ---- Create Post Modal ----
let selectedPostMedia = null;
let selectedPostTrack = null;
let currentPostType = 'text';

function openCreatePostModal() {
  selectedPostMedia = null;
  selectedPostTrack = null;
  currentPostType = 'text';
  document.getElementById('post-caption').value = '';
  document.getElementById('media-preview-container').innerHTML = '';
  document.getElementById('media-upload-area').classList.remove('show');
  document.getElementById('music-selector').classList.remove('show');
  document.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.post-type-btn[data-type="text"]')?.classList.add('active');
  openModal('create-post-modal');
}

function setPostType(type, btn) {
  currentPostType = type;
  document.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const mediaArea = document.getElementById('media-upload-area');
  const musicSelector = document.getElementById('music-selector');

  if (type === 'image') {
    mediaArea.classList.add('show');
    musicSelector.classList.remove('show');
  } else if (type === 'music') {
    musicSelector.classList.add('show');
    mediaArea.classList.remove('show');
    loadMusicSearchForPost();
  } else {
    mediaArea.classList.remove('show');
    musicSelector.classList.remove('show');
  }
}

function handleMediaSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedPostMedia = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const container = document.getElementById('media-preview-container');
    container.innerHTML = `
      <div style="position:relative;margin-bottom:12px">
        <img src="${ev.target.result}" style="width:100%;border-radius:12px;max-height:200px;object-fit:cover">
        <button onclick="clearMediaSelection()" style="position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.6);color:white;border:none;cursor:pointer;font-size:16px">×</button>
      </div>`;
  };
  reader.readAsDataURL(file);
}

function clearMediaSelection() {
  selectedPostMedia = null;
  document.getElementById('media-preview-container').innerHTML = '';
  document.getElementById('media-file-input').value = '';
}

async function loadMusicSearchForPost() {
  const container = document.getElementById('music-search-container');
  if (!container) return;
  container.innerHTML = `
    <input class="form-input" placeholder="🔍 Search for a track..." id="post-music-search" oninput="debounce(searchMusicForPost, 500)(this.value)" style="margin-bottom:10px">
    <div id="post-music-results" style="max-height:200px;overflow-y:auto"></div>`;
}

async function searchMusicForPost(query) {
  const container = document.getElementById('post-music-results');
  if (!container) return;
  if (!query) { container.innerHTML = ''; return; }
  try {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px">Searching... 🎵</div>';
    // Call Jamendo directly from browser
    const params = new URLSearchParams({ client_id: '2c1c95e4', format: 'json', audioformat: 'mp32', imagesize: 300, search: query, limit: 8, order: 'popularity_total' });
    const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`);
    const data = await res.json();
    const tracks = data.results || [];
    container.innerHTML = tracks.length ? tracks.map(t => `
      <div class="search-result-item" onclick="selectTrackForPost(${JSON.stringify(t).replace(/"/g, '&quot;')})">
        <img src="${t.album_image || t.image || ''}" class="search-result-avatar" style="border-radius:8px" alt="Art" onerror="this.style.display='none'">
        <div class="search-result-info">
          <div class="search-result-name">${t.name}</div>
          <div class="search-result-role">${t.artist_name}</div>
        </div>
        <span style="font-size:12px;color:var(--text-muted)">${formatDuration(t.duration)}</span>
      </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;padding:8px">No tracks found</div>';
  } catch { container.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px">Search failed, try again</div>'; }
}

function selectTrackForPost(track) {
  selectedPostTrack = {
    id: track.id,
    name: track.name,
    artist: track.artist_name,
    album: track.album_name,
    albumArt: track.album_image || track.image,
    previewUrl: track.audio || track.audiodownload,
    duration: track.duration,
  };
  document.getElementById('music-search-container').innerHTML = `
    <div class="selected-track-preview">
      <img src="${selectedPostTrack.albumArt || ''}" class="selected-track-art" alt="Art" onerror="this.style.display='none'">
      <div class="selected-track-info">
        <div class="selected-track-name">${selectedPostTrack.name}</div>
        <div class="selected-track-artist">${selectedPostTrack.artist}</div>
      </div>
      <button onclick="loadMusicSearchForPost()" style="color:var(--text-muted);font-size:18px;background:none;border:none;cursor:pointer">×</button>
    </div>`;
}

async function submitPost() {
  const caption = document.getElementById('post-caption').value.trim();
  if (!caption && !selectedPostMedia && !selectedPostTrack) {
    showToast('Add something to your post!', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('type', currentPostType);
  formData.append('caption', caption);
  if (selectedPostMedia) formData.append('media', selectedPostMedia);
  if (selectedPostTrack) formData.append('musicTrack', JSON.stringify(selectedPostTrack));

  const btn = document.getElementById('submit-post-btn');
  btn.disabled = true;
  btn.textContent = 'Posting... 🐝';

  try {
    const res = await api.post('/posts', formData, true);
    closeModal('create-post-modal');
    showToast('Post shared! 🔥', 'success');
    // Prepend to feed
    const container = document.getElementById('feed-posts');
    if (container) {
      container.insertAdjacentHTML('afterbegin', renderPost(res.post));
      attachPostHandlers();
    }
  } catch (err) {
    showToast(err.message || 'Failed to post', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Share Post 🐝';
  }
}

// ---- Image Modal ----
function openImageModal(url) {
  const overlay = document.getElementById('image-modal-overlay');
  const img = document.getElementById('image-modal-img');
  if (overlay && img) { img.src = url; overlay.classList.add('show'); }
}

// ---- Stories ----
async function loadStories() {
  const scroll = document.getElementById('stories-scroll');
  if (!scroll) return;

  try {
    const res = await api.get('/stories');
    const { storyGroups } = res;

    let html = `
      <div class="story-avatar" onclick="openCreateStoryModal()">
        <div class="story-add-btn">+</div>
        <div class="story-username">Your Story</div>
      </div>`;

    storyGroups.forEach(group => {
      const user = group.user;
      const hasViewed = group.stories.every(s => s.viewers?.includes(currentUser?._id));
      html += `
        <div class="story-avatar" onclick="openStoryViewer(${JSON.stringify(group).replace(/"/g, '&quot;')})">
          <div class="story-avatar-ring ${hasViewed ? 'seen' : ''}">
            <img src="${getAvatarUrl(user)}" class="story-avatar-img" alt="${user.username}" onerror="this.src='${getAvatarUrl(user)}'">
          </div>
          <div class="story-username">${user.displayName || user.username}</div>
        </div>`;
    });

    scroll.innerHTML = html;
  } catch {
    scroll.innerHTML = `<div class="story-avatar" onclick="openCreateStoryModal()"><div class="story-add-btn">+</div><div class="story-username">Your Story</div></div>`;
  }
}

// ---- Story Viewer ----
let currentStoryGroup = null;
let currentStoryIndex = 0;
let storyTimer = null;

function openStoryViewer(group) {
  currentStoryGroup = group;
  currentStoryIndex = 0;

  // Generate progress bars based on actual story count
  const barsContainer = document.getElementById('story-progress-bars');
  if (barsContainer) {
    barsContainer.innerHTML = group.stories.map(() =>
      `<div class="story-progress-bar"><div class="story-progress-fill"></div></div>`
    ).join('');
  }

  document.getElementById('story-viewer')?.classList.add('show');
  showStory(0);
}

function showStory(index) {
  if (!currentStoryGroup) return;
  const stories = currentStoryGroup.stories;
  if (index >= stories.length) { closeStoryViewer(); return; }

  const story = stories[index];
  currentStoryIndex = index;

  // Update progress bars
  const bars = document.querySelectorAll('.story-progress-fill');
  bars.forEach((bar, i) => {
    bar.style.width = i < index ? '100%' : '0%';
    bar.classList.remove('active');
  });
  if (bars[index]) {
    bars[index].classList.add('active');
    bars[index].style.transition = `width 5s linear`;
    bars[index].style.width = '100%';
  }

  // Set media
  const media = document.getElementById('story-media');
  if (media) { media.src = story.mediaUrl; media.onerror = () => {}; }

  // Set header
  document.getElementById('story-viewer-name').textContent = currentStoryGroup.user.displayName || currentStoryGroup.user.username;
  document.getElementById('story-viewer-time').textContent = timeAgo(story.createdAt);
  const viewerAvatar = document.getElementById('story-viewer-avatar');
  if (viewerAvatar) viewerAvatar.src = getAvatarUrl(currentStoryGroup.user);

  // Caption
  const caption = document.getElementById('story-caption');
  if (caption) caption.textContent = story.caption || '';

  // Mark as viewed
  api.post(`/stories/${story._id}/view`).catch(() => {});

  // Auto-advance
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => showStory(index + 1), 5000);
}

function nextStory() { showStory(currentStoryIndex + 1); }
function prevStory() { showStory(Math.max(0, currentStoryIndex - 1)); }
function closeStoryViewer() {
  clearTimeout(storyTimer);
  document.getElementById('story-viewer')?.classList.remove('show');
}

// ---- Create Story Modal ----
function openCreateStoryModal() {
  openModal('create-story-modal');
}

async function submitStory() {
  const fileInput = document.getElementById('story-file-input');
  const file = fileInput?.files[0];
  if (!file) { showToast('Select an image or video first', 'error'); return; }

  const formData = new FormData();
  formData.append('media', file);
  const caption = document.getElementById('story-caption-input')?.value;
  if (caption) formData.append('caption', caption);

  const btn = document.getElementById('submit-story-btn');
  btn.disabled = true;
  btn.textContent = 'Uploading...';

  try {
    await api.post('/stories', formData, true);
    closeModal('create-story-modal');
    showToast('Story posted! 🌟', 'success');
    loadStories();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Share Story';
  }
}

// ---- Suggested Users Widget ----
async function loadSuggestedUsers() {
  const container = document.getElementById('suggested-users-list');
  if (!container) return;
  try {
    const res = await api.get('/users/suggested');
    container.innerHTML = res.users.slice(0, 5).map(user => `
      <div class="suggested-user">
        <img src="${getAvatarUrl(user)}" class="suggested-avatar" alt="${user.username}" onclick="navigateTo('profile', {username: '${user.username}'})" onerror="this.src='${getAvatarUrl(user)}'">
        <div class="suggested-info">
          <div class="suggested-name" onclick="navigateTo('profile', {username: '${user.username}'})">${user.displayName || user.username}</div>
          <div class="suggested-role">${user.role}</div>
        </div>
        <button class="follow-btn not-following" data-user-id="${user._id}" onclick="handleFollowUser('${user._id}', this)">Follow</button>
      </div>`).join('');
  } catch {}
}

// ---- Infinite Scroll ----
function initInfiniteScroll() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  mainContent.addEventListener('scroll', debounce(() => {
    const { scrollTop, scrollHeight, clientHeight } = mainContent;
    if (scrollHeight - scrollTop - clientHeight < 400) loadFeed();
  }, 200));
}
// ---- Trending Music Widget ----
async function loadTrendingMusicWidget() {
  const container = document.getElementById('trending-music-list');
  if (!container) return;
  try {
    const res = await api.get('/music/trending?limit=5');
    const tracks = res.tracks || [];
    if (!tracks.length) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px">No tracks available</div>';
      return;
    }
    container.innerHTML = tracks.map(t => `
      <div class="suggested-user" style="cursor:pointer" onclick="playTrack({id:'${t.id}',name:'${t.name}',artist:'${t.artist_name}',albumArt:'${t.album_image||t.image||''}',previewUrl:'${t.audio||''}',duration:${t.duration||0}})">
        <img src="${t.album_image || t.image || ''}" class="suggested-avatar" style="border-radius:8px" alt="${t.name}" onerror="this.style.background='var(--bg-tertiary)'">
        <div class="suggested-info">
          <div class="suggested-name">${t.name}</div>
          <div class="suggested-role">${t.artist_name}</div>
        </div>
        <span style="font-size:12px;color:var(--text-muted)">${formatDuration(t.duration)}</span>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px">No tracks available</div>';
  }
}
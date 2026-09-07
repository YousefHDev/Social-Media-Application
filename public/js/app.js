/**
 * Pulse Social Media - Main Application Logic
 * Vanilla JavaScript SPA Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // App State Management
  // ==========================================
  let currentUser = null;
  let currentPage = 1;
  let hasMorePosts = false;
  let isLoadingPosts = false;
  let activeSort = 'latest';
  let activeFilter = 'all'; // 'all', 'myposts', 'frozen'
  let activeTag = '';
  let searchQuery = '';
  let openCommentsPostId = null;

  // ==========================================
  // UI Elements Selectors
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  const loggedOutActions = document.getElementById('logged-out-actions');
  const loggedInActions = document.getElementById('logged-in-actions');
  const openLoginBtn = document.getElementById('open-login-btn');
  const openSignupBtn = document.getElementById('open-signup-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const navUserAvatar = document.getElementById('nav-user-avatar');
  const navUserName = document.getElementById('nav-user-name');
  const navUserProfileBtn = document.getElementById('nav-user-profile-btn');

  const authModal = document.getElementById('auth-modal');
  const closeAuthModal = document.getElementById('close-auth-modal');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  const profileModal = document.getElementById('profile-modal');
  const closeProfileModal = document.getElementById('close-profile-modal');
  const editProfileForm = document.getElementById('edit-profile-form');
  const editNameInput = document.getElementById('edit-name');
  const editBioInput = document.getElementById('edit-bio');
  const openEditProfileBtn = document.getElementById('open-edit-profile-btn');

  const createPostContainer = document.getElementById('create-post-container');
  const createPostForm = document.getElementById('create-post-form');
  const postContentInput = document.getElementById('post-content-input');
  const postTagsInput = document.getElementById('post-tags-input');
  const createPostAvatar = document.getElementById('create-post-avatar');

  const postsStream = document.getElementById('posts-stream');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const searchInput = document.getElementById('search-input');

  const navHome = document.getElementById('nav-home');
  const navMyPosts = document.getElementById('nav-my-posts');
  const navFrozenFeed = document.getElementById('nav-frozen-feed');
  const navProfile = document.getElementById('nav-profile');

  const widgetAvatar = document.getElementById('widget-avatar');
  const widgetName = document.getElementById('widget-name');
  const widgetBio = document.getElementById('widget-bio');
  const widgetStats = document.getElementById('widget-stats');
  const widgetPostCount = document.getElementById('widget-post-count');
  const widgetActions = document.getElementById('widget-actions');
  const uploadAvatarTrigger = document.getElementById('upload-avatar-trigger');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const shareProfileBtn = document.getElementById('share-profile-btn');

  // ==========================================
  // Theme Management (Night / Morning Mode)
  // ==========================================
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Night Mode';
    } else {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Morning Mode';
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // ==========================================
  // Toast Alert Notification System
  // ==========================================
  const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Global Session Expiration Event Callback
  window.appEvents = {
    onSessionExpired: () => {
      updateAuthUI(null);
      showToast('Your session has expired. Please log in again.', 'warning');
      openModal(authModal);
    }
  };

  // ==========================================
  // Auth State & User Profile UI
  // ==========================================
  const checkAuthState = async () => {
    const token = window.apiService.getAccessToken();
    if (!token) {
      updateAuthUI(null);
      fetchPosts(true);
      return;
    }

    try {
      const response = await window.apiService.get('/auth/me');
      currentUser = response.data.user;
      updateAuthUI(currentUser);
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      updateAuthUI(null);
    }
    fetchPosts(true);
  };

  const updateAuthUI = (user) => {
    currentUser = user;
    if (user) {
      loggedOutActions.style.display = 'none';
      loggedInActions.style.display = 'flex';
      createPostContainer.style.display = 'block';
      uploadAvatarTrigger.style.display = 'flex';
      widgetStats.style.display = 'flex';
      widgetActions.style.display = 'flex';

      const avatarSrc = user.avatar ? user.avatar : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(user.name)}`;
      navUserAvatar.src = avatarSrc;
      navUserName.textContent = user.name;
      createPostAvatar.src = avatarSrc;

      widgetAvatar.src = avatarSrc;
      widgetName.textContent = user.name;
      widgetBio.textContent = user.bio || 'No bio provided yet.';

      // Fetch user stats
      fetchUserStats(user._id);
    } else {
      loggedOutActions.style.display = 'flex';
      loggedInActions.style.display = 'none';
      createPostContainer.style.display = 'none';
      uploadAvatarTrigger.style.display = 'none';
      widgetStats.style.display = 'none';
      widgetActions.style.display = 'none';

      widgetAvatar.src = `${window.CONFIG.DEFAULT_AVATAR}Guest`;
      widgetName.textContent = 'Guest User';
      widgetBio.textContent = 'Log in to write posts, like content, and interact with the community.';
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const response = await window.apiService.get(`/users/${userId}`);
      if (response.data && response.data.stats) {
        widgetPostCount.textContent = response.data.stats.postsCount || 0;
      }
    } catch (err) {
      console.error('Error fetching user stats:', err.message);
    }
  };

  // ==========================================
  // Modal Handlers
  // ==========================================
  const openModal = (modal) => modal.classList.add('active');
  const closeModal = (modal) => modal.classList.remove('active');

  openLoginBtn.addEventListener('click', () => {
    switchTab('login');
    openModal(authModal);
  });

  openSignupBtn.addEventListener('click', () => {
    switchTab('signup');
    openModal(authModal);
  });

  closeAuthModal.addEventListener('click', () => closeModal(authModal));
  closeProfileModal.addEventListener('click', () => closeModal(profileModal));

  const switchTab = (tab) => {
    loginError.style.display = 'none';
    signupError.style.display = 'none';
    if (tab === 'login') {
      tabLogin.style.background = 'var(--bg-card)';
      tabLogin.style.color = 'var(--text-main)';
      tabSignup.style.background = 'transparent';
      tabSignup.style.color = 'var(--text-muted)';
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
      document.getElementById('auth-modal-title').textContent = 'Welcome Back';
    } else {
      tabSignup.style.background = 'var(--bg-card)';
      tabSignup.style.color = 'var(--text-main)';
      tabLogin.style.background = 'transparent';
      tabLogin.style.color = 'var(--text-muted)';
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
      document.getElementById('auth-modal-title').textContent = 'Join Pulse Today';
    }
  };

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // ==========================================
  // Auth Form Submissions
  // ==========================================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const response = await window.apiService.post('/auth/login', { email, password });
      window.apiService.setTokens(response.data.accessToken, response.data.refreshToken);
      updateAuthUI(response.data.user);
      closeModal(authModal);
      showToast('Successfully logged in!', 'success');
      fetchPosts(true);
    } catch (err) {
      loginError.textContent = err.message || 'Login failed';
      loginError.style.display = 'block';
    }
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.style.display = 'none';

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
      signupError.textContent = 'Passwords do not match';
      signupError.style.display = 'block';
      return;
    }

    try {
      const response = await window.apiService.post('/auth/signup', { name, email, password, confirmPassword });
      window.apiService.setTokens(response.data.accessToken, response.data.refreshToken);
      updateAuthUI(response.data.user);
      closeModal(authModal);
      showToast('Account created successfully!', 'success');
      fetchPosts(true);
    } catch (err) {
      signupError.textContent = err.message || 'Signup failed';
      signupError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await window.apiService.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API failed:', err.message);
    }
    window.apiService.clearTokens();
    updateAuthUI(null);
    showToast('Logged out successfully', 'info');
    fetchPosts(true);
  });

  // Edit Profile
  openEditProfileBtn.addEventListener('click', () => {
    if (!currentUser) return;
    editNameInput.value = currentUser.name;
    editBioInput.value = currentUser.bio || '';
    openModal(profileModal);
  });

  editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = editNameInput.value.trim();
    const bio = editBioInput.value.trim();

    try {
      const response = await window.apiService.put('/users/profile', { name, bio });
      currentUser = response.data.user;
      updateAuthUI(currentUser);
      closeModal(profileModal);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      document.getElementById('edit-profile-error').textContent = err.message || 'Failed to update profile';
      document.getElementById('edit-profile-error').style.display = 'block';
    }
  });

  // Avatar Upload
  avatarFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Uploading avatar...', 'info');
      const response = await window.apiService.upload('/users/avatar', formData);
      currentUser = response.data.user;
      updateAuthUI(currentUser);
      showToast('Avatar updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload avatar', 'error');
    }
  });

  // Share Profile Link
  shareProfileBtn.addEventListener('click', () => {
    if (!currentUser) return;
    const shareUrl = `${window.location.origin}/#user/${currentUser._id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Profile link copied to clipboard! 🔗', 'success');
    }).catch(() => {
      showToast(`Profile Link: ${shareUrl}`, 'info');
    });
  });

  // ==========================================
  // Post Creation Handler
  // ==========================================
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
      openModal(authModal);
      return;
    }

    const content = postContentInput.value.trim();
    const tagsRaw = postTagsInput.value.trim();
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!content) return;

    try {
      await window.apiService.post('/posts', { content, tags });
      postContentInput.value = '';
      postTagsInput.value = '';
      showToast('Post published!', 'success');
      fetchPosts(true);
      if (currentUser) fetchUserStats(currentUser._id);
    } catch (err) {
      showToast(err.message || 'Failed to publish post', 'error');
    }
  });

  // ==========================================
  // Posts Feed & Filtering Logic
  // ==========================================
  const fetchPosts = async (reset = false) => {
    if (isLoadingPosts) return;
    isLoadingPosts = true;

    if (reset) {
      currentPage = 1;
      postsStream.innerHTML = '<div class="spinner"></div>';
    }

    try {
      let endpoint = `/posts?page=${currentPage}&limit=5&sortBy=${activeSort}`;
      
      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (activeTag) {
        endpoint += `&tag=${encodeURIComponent(activeTag)}`;
      }

      if (activeFilter === 'myposts' && currentUser) {
        endpoint += `&author=${currentUser._id}`;
      } else if (activeFilter === 'frozen') {
        endpoint += `&isFrozen=true`;
      }

      const response = await window.apiService.get(endpoint);
      const { posts, pagination } = response.data;

      hasMorePosts = pagination.hasMore;
      loadMoreBtn.style.display = hasMorePosts ? 'inline-block' : 'none';

      if (reset) {
        postsStream.innerHTML = '';
      }

      if (posts.length === 0 && currentPage === 1) {
        postsStream.innerHTML = `
          <div class="card empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
            <h3>No posts found</h3>
            <p>Be the first to start a conversation!</p>
          </div>
        `;
      } else {
        posts.forEach(post => {
          postsStream.appendChild(renderPostCard(post));
        });
      }
    } catch (err) {
      postsStream.innerHTML = `
        <div class="card empty-state" style="color: var(--danger);">
          <p>Error loading posts: ${err.message}</p>
        </div>
      `;
    } finally {
      isLoadingPosts = false;
    }
  };

  // Render Post Card HTML
  const renderPostCard = (post) => {
    const card = document.createElement('article');
    card.className = 'card post-card';
    card.dataset.id = post._id;

    const isOwner = currentUser && currentUser._id === (post.author._id || post.author);
    const isLiked = currentUser && post.likes && post.likes.includes(currentUser._id);
    const authorName = post.author ? post.author.name : 'Unknown User';
    const authorAvatar = (post.author && post.author.avatar)
      ? post.author.avatar
      : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(authorName)}`;

    const dateFormatted = new Date(post.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const tagsHTML = post.tags && post.tags.length > 0
      ? post.tags.map(t => `<span class="tag-badge" data-tag="${t}">#${t}</span>`).join('')
      : '';

    card.innerHTML = `
      <div class="post-header">
        <div class="post-author-info">
          <img class="author-avatar" src="${authorAvatar}" alt="${authorName}">
          <div class="author-meta">
            <span class="author-name">${authorName}</span>
            <span class="post-timestamp">${dateFormatted}</span>
          </div>
        </div>
        <div class="post-badges">
          ${post.isFrozen ? `<span class="badge-frozen">❄️ Frozen</span>` : ''}
          ${isOwner ? `
            <button class="btn btn-sm btn-secondary freeze-btn ${post.isFrozen ? 'btn-danger' : ''}" title="${post.isFrozen ? 'Unfreeze Post' : 'Freeze Post'}">
              ${post.isFrozen ? 'Unfreeze 🔓' : 'Freeze ❄️'}
            </button>
            <button class="btn btn-sm btn-outline delete-btn" title="Delete Post">🗑️</button>
          ` : ''}
        </div>
      </div>

      <div class="post-content">${escapeHTML(post.content)}</div>
      
      ${tagsHTML ? `<div class="post-tags">${tagsHTML}</div>` : ''}

      <div class="post-actions">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" ${post.isFrozen ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="like-count">${post.likeCount || 0}</span>
        </button>

        <button class="action-btn comment-toggle-btn">
          💬 <span class="comment-count">${post.commentCount || 0}</span> Comments
        </button>
      </div>

      <div class="comments-section" style="display: none;">
        <div class="comment-input-box">
          <input type="text" class="comment-input" placeholder="${post.isFrozen ? 'Post is frozen. Comments disabled.' : 'Write a comment...'}" ${post.isFrozen || !currentUser ? 'disabled' : ''}>
          <button class="btn btn-sm btn-primary send-comment-btn" ${post.isFrozen || !currentUser ? 'disabled' : ''}>Post</button>
        </div>
        <div class="comments-list">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    // Event Listeners for Post Actions
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', async () => {
      if (!currentUser) return openModal(authModal);
      try {
        const res = await window.apiService.post(`/posts/${post._id}/like`, {});
        const countSpan = card.querySelector('.like-count');
        countSpan.textContent = res.data.likeCount;
        if (res.data.isLiked) {
          likeBtn.classList.add('liked');
        } else {
          likeBtn.classList.remove('liked');
        }
      } catch (err) {
        showToast(err.message || 'Failed to toggle like', 'error');
      }
    });

    // Freeze Toggle Button
    const freezeBtn = card.querySelector('.freeze-btn');
    if (freezeBtn) {
      freezeBtn.addEventListener('click', async () => {
        try {
          const res = await window.apiService.patch(`/posts/${post._id}/freeze`, {});
          showToast(res.message, 'success');
          fetchPosts(true);
        } catch (err) {
          showToast(err.message || 'Failed to toggle freeze state', 'error');
        }
      });
    }

    // Delete Button
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
          await window.apiService.delete(`/posts/${post._id}`);
          showToast('Post deleted', 'info');
          card.remove();
          if (currentUser) fetchUserStats(currentUser._id);
        } catch (err) {
          showToast(err.message || 'Failed to delete post', 'error');
        }
      });
    }

    // Comments Section Toggle
    const commentToggleBtn = card.querySelector('.comment-toggle-btn');
    const commentsSection = card.querySelector('.comments-section');
    const commentsList = card.querySelector('.comments-list');
    const commentInput = card.querySelector('.comment-input');
    const sendCommentBtn = card.querySelector('.send-comment-btn');

    commentToggleBtn.addEventListener('click', () => {
      const isVisible = commentsSection.style.display === 'block';
      commentsSection.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        loadComments(post._id, commentsList, card);
      }
    });

    sendCommentBtn.addEventListener('click', async () => {
      const content = commentInput.value.trim();
      if (!content) return;
      try {
        const res = await window.apiService.post(`/posts/${post._id}/comments`, { content });
        commentInput.value = '';
        card.querySelector('.comment-count').textContent = res.data.commentCount;
        loadComments(post._id, commentsList, card);
      } catch (err) {
        showToast(err.message || 'Failed to post comment', 'error');
      }
    });

    // Tag Filter Clicks
    card.querySelectorAll('.tag-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        activeTag = e.target.dataset.tag;
        showToast(`Filtering by tag: #${activeTag}`, 'info');
        fetchPosts(true);
      });
    });

    return card;
  };

  // Load Comments for a Post
  const loadComments = async (postId, container, postCard) => {
    container.innerHTML = '<div class="spinner"></div>';
    try {
      const response = await window.apiService.get(`/posts/${postId}/comments`);
      const comments = response.data.comments;

      if (comments.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">No comments yet.</p>';
        return;
      }

      container.innerHTML = '';
      comments.forEach(comment => {
        const authorName = comment.author ? comment.author.name : 'User';
        const authorAvatar = (comment.author && comment.author.avatar)
          ? comment.author.avatar
          : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(authorName)}`;

        const isCommentOwner = currentUser && currentUser._id === (comment.author._id || comment.author);

        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        commentEl.innerHTML = `
          <img class="comment-avatar" src="${authorAvatar}" alt="${authorName}">
          <div class="comment-content-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="comment-author-name">${authorName}</span>
              ${isCommentOwner ? `<button class="delete-comment-btn" style="color:var(--danger); font-size:0.75rem;">Delete</button>` : ''}
            </div>
            <div class="comment-text">${escapeHTML(comment.content)}</div>
          </div>
        `;

        if (isCommentOwner) {
          commentEl.querySelector('.delete-comment-btn').addEventListener('click', async () => {
            try {
              const res = await window.apiService.delete(`/comments/${comment._id}`);
              commentEl.remove();
              if (res.data && res.data.commentCount !== undefined) {
                postCard.querySelector('.comment-count').textContent = res.data.commentCount;
              }
            } catch (err) {
              showToast(err.message || 'Failed to delete comment', 'error');
            }
          });
        }

        container.appendChild(commentEl);
      });
    } catch (err) {
      container.innerHTML = `<p style="color:var(--danger); font-size:0.85rem;">Failed to load comments</p>`;
    }
  };

  // Helper function to escape HTML string
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Filter Pill buttons (Latest, Popular, Oldest)
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeSort = e.target.dataset.sort;
      fetchPosts(true);
    });
  });

  // Search Input Handler with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      fetchPosts(true);
    }, 400);
  });

  // Sidebar Nav Links
  navHome.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navHome);
    activeFilter = 'all';
    activeTag = '';
    fetchPosts(true);
  });

  navMyPosts.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) return openModal(authModal);
    setActiveNav(navMyPosts);
    activeFilter = 'myposts';
    activeTag = '';
    fetchPosts(true);
  });

  navFrozenFeed.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveNav(navFrozenFeed);
    activeFilter = 'frozen';
    activeTag = '';
    fetchPosts(true);
  });

  navProfile.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) return openModal(authModal);
    setActiveNav(navProfile);
    openModal(profileModal);
  });

  const setActiveNav = (navEl) => {
    [navHome, navMyPosts, navFrozenFeed, navProfile].forEach(el => el.classList.remove('active'));
    navEl.classList.add('active');
  };

  // Load More Button
  loadMoreBtn.addEventListener('click', () => {
    if (hasMorePosts && !isLoadingPosts) {
      currentPage++;
      fetchPosts(false);
    }
  });

  // ==========================================
  // Initialization
  // ==========================================
  initTheme();
  checkAuthState();
});

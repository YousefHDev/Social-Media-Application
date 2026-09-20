/**
 * VibeSpace - Main Application Logic
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
  let activeFeedType = 'global'; // 'global' | 'following'
  let activeTag = '';
  let searchQuery = '';
  let currentModalTargetUserId = null;
  let activeFollowTab = 'followers';
  let activeSearchType = 'all';
  let activeSearchQuery = '';
  let activeSearchPage = 1;
  let activeSearchData = { users: [], posts: [], hashtags: [] };
  let activeStories = [];
  let activeStoryIndex = 0;
  let storyTimer = null;

  // Chat State
  let socket = null;
  let onlineUserIds = new Set();
  let activeConversationId = null;
  let activeRecipientId = null;
  let activeRecipientUser = null;
  let typingTimeout = null;

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
  const notificationBellBtn = document.getElementById('notification-bell-btn');
  const notificationPanel = document.getElementById('notification-panel');
  const notificationList = document.getElementById('notification-list');
  const notificationUnreadBadge = document.getElementById('notification-unread-badge');
  const notificationMarkAll = document.getElementById('notification-mark-all');
  const storiesRail = document.getElementById('stories-rail');
  const createStoryBtn = document.getElementById('create-story-btn');
  const storyCreateModal = document.getElementById('story-create-modal');
  const closeStoryCreateModal = document.getElementById('close-story-create-modal');
  const storyCreateForm = document.getElementById('story-create-form');
  const storyMediaInput = document.getElementById('story-media-input');
  const storyMediaPreview = document.getElementById('story-media-preview');
  const storyCaptionInput = document.getElementById('story-caption-input');
  const publishStoryBtn = document.getElementById('publish-story-btn');
  const storyViewerModal = document.getElementById('story-viewer-modal');
  const storyViewerMedia = document.getElementById('story-viewer-media');
  const storyViewerAuthor = document.getElementById('story-viewer-author');
  const storyViewerCaption = document.getElementById('story-viewer-caption');
  const storyViewerViewers = document.getElementById('story-viewer-viewers');
  const storyProgress = document.getElementById('story-progress');
  const storyDeleteBtn = document.getElementById('story-delete');

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

  // Follow Modal Elements
  const followModal = document.getElementById('follow-modal');
  const closeFollowModal = document.getElementById('close-follow-modal');
  const tabFollowers = document.getElementById('tab-followers');
  const tabFollowing = document.getElementById('tab-following');
  const followUserList = document.getElementById('follow-user-list');
  const followModalTitle = document.getElementById('follow-modal-title');
  const followModalSubtitle = document.getElementById('follow-modal-subtitle');

  // Chat Elements
  const chatModal = document.getElementById('chat-modal');
  const closeChatModal = document.getElementById('close-chat-modal');
  const navMessages = document.getElementById('nav-messages');
  const mobileNavMessages = document.getElementById('mobile-nav-messages');
  const navUnreadBadge = document.getElementById('nav-unread-badge');
  const conversationsList = document.getElementById('conversations-list');
  const chatHeader = document.getElementById('chat-header');
  const chatRecipientAvatar = document.getElementById('chat-recipient-avatar');
  const chatRecipientName = document.getElementById('chat-recipient-name');
  const chatRecipientSub = document.getElementById('chat-recipient-sub');
  const chatRecipientStatus = document.getElementById('chat-recipient-status');
  const chatPlaceholder = document.getElementById('chat-placeholder');
  const chatMessagesContainer = document.getElementById('chat-messages-container');
  const chatTypingIndicator = document.getElementById('chat-typing-indicator');
  const chatMessageForm = document.getElementById('chat-message-form');
  const chatInputField = document.getElementById('chat-input-field');

  const createPostContainer = document.getElementById('create-post-container');
  const createPostForm = document.getElementById('create-post-form');
  const postContentInput = document.getElementById('post-content-input');
  const postTagsInput = document.getElementById('post-tags-input');
  const createPostAvatar = document.getElementById('create-post-avatar');

  // Feed Switcher Elements
  const feedTabGlobal = document.getElementById('feed-tab-global');
  const feedTabFollowing = document.getElementById('feed-tab-following');

  const postsStream = document.getElementById('posts-stream');
  const hashtagPageHeader = document.getElementById('hashtag-page-header');
  const hashtagPageTitle = document.getElementById('hashtag-page-title');
  const hashtagPageCount = document.getElementById('hashtag-page-count');
  const hashtagRecentBtn = document.getElementById('hashtag-recent-btn');
  const hashtagPopularBtn = document.getElementById('hashtag-popular-btn');
  const hashtagLoadMore = document.getElementById('hashtag-load-more');
  let hashtagPage = 1;
  let hashtagSort = 'recent';
  const loadMoreBtn = document.getElementById('load-more-btn');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchResultsPanel = document.getElementById('search-results-panel');
  const searchResultsBody = document.getElementById('search-results-body');
  const feedStatusText = document.getElementById('feed-status-text');

  const navHome = document.getElementById('nav-home');
  const navMyPosts = document.getElementById('nav-my-posts');
  const navFrozenFeed = document.getElementById('nav-frozen-feed');
  const navProfile = document.getElementById('nav-profile');

  // Mobile Bottom Nav Elements
  const mobileNavHome = document.getElementById('mobile-nav-home');
  const mobileNavMyPosts = document.getElementById('mobile-nav-myposts');
  const mobileNavFrozen = document.getElementById('mobile-nav-frozen');
  const mobileNavProfile = document.getElementById('mobile-nav-profile');

  // Sidebar Profile Widget Elements
  const widgetAvatar = document.getElementById('widget-avatar');
  const widgetName = document.getElementById('widget-name');
  const widgetBio = document.getElementById('widget-bio');
  const widgetStats = document.getElementById('widget-stats');
  const widgetPostCount = document.getElementById('widget-post-count');
  const widgetFollowersCount = document.getElementById('widget-followers-count');
  const widgetFollowingCount = document.getElementById('widget-following-count');
  const statFollowers = document.getElementById('stat-followers');
  const statFollowing = document.getElementById('stat-following');
  const widgetActions = document.getElementById('widget-actions');
  const uploadAvatarTrigger = document.getElementById('upload-avatar-trigger');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const shareProfileBtn = document.getElementById('share-profile-btn');

  // Nav User Profile Button (avatar + name in navbar when logged in)
  const navUserProfileBtn = document.getElementById('nav-user-profile-btn');

  // Suggested Users Widget Elements
  const suggestedUsersList = document.getElementById('suggested-users-list');
  const trendingHashtagsList = document.getElementById('trending-hashtags-list');
  const refreshSuggestedBtn = document.getElementById('refresh-suggested-btn');

  // ==========================================
  // Theme Management (Night / Morning Mode)
  // ==========================================
  const initTheme = () => {
    const savedTheme = localStorage.getItem('vibespace_theme') || 'dark';
    setTheme(savedTheme);
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vibespace_theme', theme);
    if (theme === 'dark') {
      themeIcon.textContent = '🌙';
      if (themeText) themeText.textContent = 'Night Mode';
    } else {
      themeIcon.textContent = '☀️';
      if (themeText) themeText.textContent = 'Morning Mode';
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
    if (type === 'success') icon = '✨';
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

  // Global Session Expiration Callback
  window.appEvents = {
    onSessionExpired: () => {
      updateAuthUI(null);
      showToast('Your VibeSpace session has expired. Please log in again.', 'warning');
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
      loadSuggestedUsers();
      return;
    }

    try {
      const response = await window.apiService.get('/auth/me');
      currentUser = response.data.user;
      updateAuthUI(currentUser);
      initSocketConnection();
    } catch (err) {
      console.warn('VibeSpace Auth Check Failed:', err.message);
      updateAuthUI(null);
    }
    fetchPosts(true);
    loadSuggestedUsers();
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
      widgetBio.textContent = user.bio || 'No bio provided yet. Click edit to customize!';

      fetchUserStats(user._id);
      loadNotifications();
      loadStories();
    } else {
      loggedOutActions.style.display = 'flex';
      loggedInActions.style.display = 'none';
      createPostContainer.style.display = 'none';
      uploadAvatarTrigger.style.display = 'none';
      widgetStats.style.display = 'none';
      widgetActions.style.display = 'none';

      widgetAvatar.src = `${window.CONFIG.DEFAULT_AVATAR}Guest`;
      widgetName.textContent = 'Guest User';
      widgetBio.textContent = 'Log in to publish posts, give likes, follow users, and share your VibeSpace profile!';

      if (socket) {
        socket.disconnect();
        socket = null;
      }
      if (notificationPanel) notificationPanel.style.display = 'none';
      if (notificationUnreadBadge) notificationUnreadBadge.style.display = 'none';
    }
  };

  const loadStories = async () => {
    if (!storiesRail) return;
    if (!currentUser) {
      storiesRail.innerHTML = '<div class="story-empty">Log in to see stories.</div>';
      return;
    }
    try {
      const response = await window.apiService.getStories();
      const groups = response.data.stories || [];
      activeStories = groups.flatMap((group) => group.stories);
      storiesRail.innerHTML = '';
      if (!groups.length) {
        storiesRail.innerHTML = '<div class="story-empty">No active stories yet. Add the first one.</div>';
        return;
      }
      groups.forEach((group) => {
        const tile = document.createElement('button');
        const hasUnseen = group.stories.some((story) => !story.hasViewed);
        tile.className = `story-tile ${hasUnseen ? '' : 'seen'}`;
        const avatar = group.author.avatar || `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(group.author.name)}`;
        tile.innerHTML = `
          <img class="story-tile-avatar" src="${avatar}" alt="${escapeHTML(group.author.name)}">
          <span class="story-tile-name">${escapeHTML(group.author.name)}</span>
        `;
        tile.addEventListener('click', () => openStoryViewer(group.stories));
        storiesRail.appendChild(tile);
      });
    } catch (err) {
      storiesRail.innerHTML = '<div class="story-empty">Unable to load stories.</div>';
      console.error('Error loading stories:', err.message);
    }
  };

  const renderStory = async () => {
    const story = activeStories[activeStoryIndex];
    if (!story) {
      closeStoryViewer();
      return;
    }
    clearTimeout(storyTimer);
    storyViewerAuthor.textContent = story.author ? story.author.name : 'Story';
    storyViewerCaption.textContent = story.caption || '';
    storyViewerViewers.textContent = '';
    storyViewerViewers.onclick = null;
    const isStoryOwner = story.author && currentUser
      && story.author._id.toString() === currentUser._id.toString();
    storyDeleteBtn.hidden = !isStoryOwner;
    if (isStoryOwner) {
      storyViewerViewers.textContent = `${story.viewCount || 0} view${story.viewCount === 1 ? '' : 's'} (tap to view)`;
      storyViewerViewers.style.cursor = 'pointer';
      storyViewerViewers.onclick = async () => {
        try {
          const response = await window.apiService.getStoryViewers(story._id);
          const names = (response.data.viewers || [])
            .map((viewer) => viewer.user && viewer.user.name)
            .filter(Boolean);
          storyViewerViewers.textContent = names.length
            ? `Viewed by: ${names.map((name) => escapeHTML(name)).join(', ')}`
            : 'No viewers yet';
        } catch (err) {
          showToast(err.message || 'Unable to load viewers', 'error');
        }
      };
    }
    storyViewerMedia.innerHTML = story.mediaType === 'video'
      ? `<video src="${story.mediaUrl}" autoplay playsinline controls></video>`
      : `<img src="${story.mediaUrl}" alt="Story">`;
    storyProgress.style.setProperty('--story-progress', `${((activeStoryIndex + 1) / activeStories.length) * 100}%`);
    storyViewerModal.classList.add('active');
    try {
      await window.apiService.viewStory(story._id);
      story.hasViewed = true;
    } catch (err) {
      console.error('Error recording story view:', err.message);
    }

    if (story.mediaType === 'image') {
      storyTimer = setTimeout(() => showNextStory(), 5000);
    } else {
      const video = storyViewerMedia.querySelector('video');
      video.addEventListener('ended', showNextStory, { once: true });
    }
  };

  const openStoryViewer = (stories) => {
    activeStories = stories;
    activeStoryIndex = 0;
    renderStory();
  };

  const closeStoryViewer = () => {
    clearTimeout(storyTimer);
    storyViewerModal.classList.remove('active');
    storyViewerMedia.innerHTML = '';
    loadStories();
  };

  const showNextStory = () => {
    if (activeStoryIndex < activeStories.length - 1) {
      activeStoryIndex += 1;
      renderStory();
    } else {
      closeStoryViewer();
    }
  };

  const showPreviousStory = () => {
    if (activeStoryIndex > 0) {
      activeStoryIndex -= 1;
      renderStory();
    }
  };

  createStoryBtn.addEventListener('click', () => {
    if (!currentUser) return openModal(authModal);
    storyMediaInput.click();
  });

  closeStoryCreateModal.addEventListener('click', () => closeModal(storyCreateModal));
  document.getElementById('close-story-viewer').addEventListener('click', closeStoryViewer);
  document.getElementById('story-next').addEventListener('click', showNextStory);
  document.getElementById('story-prev').addEventListener('click', showPreviousStory);
  storyDeleteBtn.addEventListener('click', async () => {
    const story = activeStories[activeStoryIndex];
    if (!story || storyDeleteBtn.disabled) return;
    if (!window.confirm('Delete this story? This action cannot be undone.')) return;

    storyDeleteBtn.disabled = true;
    try {
      await window.apiService.deleteStory(story._id);
      closeStoryViewer();
      showToast('Story deleted successfully.', 'success');
      await loadStories();
    } catch (err) {
      showToast(err.message || 'Unable to delete story.', 'error');
    } finally {
      storyDeleteBtn.disabled = false;
    }
  });

  storyMediaInput.addEventListener('change', () => {
    const file = storyMediaInput.files[0];
    if (!file) {
      storyMediaPreview.innerHTML = '';
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    storyMediaPreview.innerHTML = file.type.startsWith('video/')
      ? `<video src="${previewUrl}" controls></video>`
      : `<img src="${previewUrl}" alt="Story preview">`;
    openModal(storyCreateModal);
  });

  storyCreateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = storyMediaInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', storyCaptionInput.value.trim());
    publishStoryBtn.disabled = true;
    publishStoryBtn.textContent = 'Publishing...';
    try {
      await window.apiService.createStory(formData);
      storyCreateForm.reset();
      storyMediaPreview.innerHTML = '';
      closeModal(storyCreateModal);
      showToast('Story published for 24 hours!', 'success');
      loadStories();
    } catch (err) {
      showToast(err.message || 'Failed to publish story', 'error');
    } finally {
      publishStoryBtn.disabled = false;
      publishStoryBtn.textContent = 'Publish story';
    }
  });

  document.querySelectorAll('.story-reaction').forEach((button) => {
    button.addEventListener('click', async () => {
      const story = activeStories[activeStoryIndex];
      if (!story) return;
      try {
        const reaction = story.myReaction === button.dataset.reaction ? null : button.dataset.reaction;
        await window.apiService.reactToStory(story._id, reaction);
        story.myReaction = reaction;
        showToast(reaction ? 'Reaction sent' : 'Reaction removed', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update reaction', 'error');
      }
    });
  });

  const notificationTarget = (notification) => {
    if (notification.type === 'message') return `#conversation/${notification.conversation || ''}`;
    if (notification.type === 'follow') return `#user/${notification.actor?._id || ''}`;
    return `#post/${notification.post || ''}`;
  };

  const loadNotifications = async () => {
    if (!currentUser || !notificationList) return;
    try {
      const response = await window.apiService.getNotifications();
      const notifications = response.data.notifications || [];
      const unreadCount = response.data.unreadCount || 0;
      notificationUnreadBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      notificationUnreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      if (!notifications.length) {
        notificationList.innerHTML = '<div class="notification-empty">You have no notifications yet.</div>';
        return;
      }
      notificationList.innerHTML = notifications.map((notification) => {
        const actor = notification.actor || {};
        const avatar = actor.avatar || `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(actor.name || 'Viber')}`;
        return `
          <a class="notification-item ${notification.read ? '' : 'unread'}"
             href="${notificationTarget(notification)}" data-notification-id="${notification._id}">
            <img class="notification-item-avatar" src="${avatar}" alt="">
            <span class="notification-item-content">
              <span class="notification-item-text"><strong>${escapeHTML(actor.name || 'Someone')}</strong> ${escapeHTML(notification.message)}</span>
              <span class="notification-item-time">${formatTimeAgo(notification.createdAt)}</span>
            </span>
          </a>
        `;
      }).join('');
      notificationList.querySelectorAll('[data-notification-id]').forEach((item) => {
        item.addEventListener('click', async () => {
          const notificationId = item.dataset.notificationId;
          if (item.classList.contains('unread')) {
            await window.apiService.markNotificationRead(notificationId);
            loadNotifications();
          }
          if (item.getAttribute('href').startsWith('#conversation/')) {
            notificationPanel.style.display = 'none';
            openChatModal();
          }
        });
      });
    } catch (err) {
      console.error('Error loading notifications:', err.message);
    }
  };

  if (notificationBellBtn) {
    notificationBellBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      notificationPanel.style.display = notificationPanel.style.display === 'none' ? 'block' : 'none';
      if (notificationPanel.style.display === 'block') loadNotifications();
    });
  }

  if (notificationMarkAll) {
    notificationMarkAll.addEventListener('click', async () => {
      await window.apiService.markAllNotificationsRead();
      loadNotifications();
    });
  }

  const fetchUserStats = async (userId) => {
    try {
      const response = await window.apiService.get(`/users/${userId}`);
      if (response.data && response.data.stats) {
        if (widgetPostCount) widgetPostCount.textContent = response.data.stats.postsCount || 0;
        if (widgetFollowersCount) widgetFollowersCount.textContent = response.data.stats.followersCount || 0;
        if (widgetFollowingCount) widgetFollowingCount.textContent = response.data.stats.followingCount || 0;
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
  if (closeFollowModal) closeFollowModal.addEventListener('click', () => closeModal(followModal));
  if (closeChatModal) closeChatModal.addEventListener('click', () => closeModal(chatModal));

  // Clicking the nav avatar/name when logged in opens Edit Profile modal
  if (navUserProfileBtn) {
    navUserProfileBtn.addEventListener('click', () => {
      if (!currentUser) return openModal(authModal);
      if (editNameInput) editNameInput.value = currentUser.name;
      if (editBioInput) editBioInput.value = currentUser.bio || '';
      openModal(profileModal);
    });
  }

  [authModal, profileModal, followModal, chatModal, storyCreateModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  const switchTab = (tab) => {
    loginError.style.display = 'none';
    signupError.style.display = 'none';
    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
      document.getElementById('auth-modal-title').textContent = 'Welcome Back to VibeSpace';
    } else {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
      document.getElementById('auth-modal-title').textContent = 'Join VibeSpace Today';
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
      initSocketConnection();
      closeModal(authModal);
      showToast('Welcome back to VibeSpace!', 'success');
      fetchPosts(true);
      loadSuggestedUsers();
    } catch (err) {
      loginError.textContent = err.message || 'Login failed. Please check credentials.';
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
      signupError.textContent = 'Passwords do not match.';
      signupError.style.display = 'block';
      return;
    }

    try {
      const response = await window.apiService.post('/auth/signup', { name, email, password, confirmPassword });
      window.apiService.setTokens(response.data.accessToken, response.data.refreshToken);
      updateAuthUI(response.data.user);
      initSocketConnection();
      closeModal(authModal);
      showToast('Account created! Welcome to VibeSpace.', 'success');
      fetchPosts(true);
      loadSuggestedUsers();
    } catch (err) {
      signupError.textContent = err.message || 'Signup failed.';
      signupError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await window.apiService.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API call exception:', err.message);
    }
    window.apiService.clearTokens();
    updateAuthUI(null);
    activeFeedType = 'global';
    setFeedSwitcherActive('global');
    showToast('Logged out of VibeSpace', 'info');
    fetchPosts(true);
    loadSuggestedUsers();
  });

  // Edit Profile Form
  if (openEditProfileBtn) {
    openEditProfileBtn.addEventListener('click', () => {
      if (!currentUser) return;
      editNameInput.value = currentUser.name;
      editBioInput.value = currentUser.bio || '';
      openModal(profileModal);
    });
  }

  if (editProfileForm) {
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
  }

  // Avatar Upload Handler
  avatarFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Uploading new avatar...', 'info');
      const response = await window.apiService.upload('/users/avatar', formData);
      currentUser = response.data.user;
      updateAuthUI(currentUser);
      showToast('Avatar updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload avatar', 'error');
    }
  });

  // Share Profile Link
  if (shareProfileBtn) {
    shareProfileBtn.addEventListener('click', () => {
      if (!currentUser) return;
      const shareUrl = `${window.location.origin}/#user/${currentUser._id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('VibeSpace profile link copied to clipboard! 🔗', 'success');
      }).catch(() => {
        showToast(`Profile Link: ${shareUrl}`, 'info');
      });
    });
  }

  // ==========================================
  // Follow System Logic
  // ==========================================

  // Load Suggested Users Widget
  const loadSuggestedUsers = async () => {
    if (!suggestedUsersList) return;
    suggestedUsersList.innerHTML = '<div class="skeleton-line" style="height: 36px; margin:0.4rem 0;"></div>';

    try {
      const response = await window.apiService.getSuggestedUsers();
      const users = response.data.suggestedUsers || [];

      if (users.length === 0) {
        suggestedUsersList.innerHTML = '<p style="font-size:0.775rem; color:var(--text-muted); padding:0.4rem 0;">No suggested vibers available.</p>';
        return;
      }

      suggestedUsersList.innerHTML = '';
      users.forEach(u => {
        const avatarSrc = u.avatar ? u.avatar : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(u.name)}`;
        const userEl = document.createElement('div');
        userEl.className = 'suggested-user-item';
        userEl.innerHTML = `
          <div class="suggested-user-meta">
            <img class="suggested-user-avatar" src="${avatarSrc}" alt="${u.name}">
            <div class="suggested-user-names">
              <span class="suggested-user-name">${u.name}</span>
              <span class="suggested-user-bio">${u.bio ? escapeHTML(u.bio) : 'VibeSpace Member'}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-follow follow-action-btn" data-userid="${u._id}">Follow</button>
        `;

        userEl.querySelector('.follow-action-btn').addEventListener('click', async (e) => {
          if (!currentUser) return openModal(authModal);
          try {
            await window.apiService.followUser(u._id);
            showToast(`Now following ${u.name}!`, 'success');
            userEl.remove();
            if (currentUser) fetchUserStats(currentUser._id);
            if (activeFeedType === 'following') fetchPosts(true);
          } catch (err) {
            showToast(err.message || 'Follow request failed', 'error');
          }
        });

        suggestedUsersList.appendChild(userEl);
      });
    } catch (err) {
      suggestedUsersList.innerHTML = '<p style="font-size:0.75rem; color:var(--danger);">Failed to load suggestions</p>';
    }
  };

  const loadTrendingHashtags = async () => {
    if (!trendingHashtagsList) return;
    try {
      const response = await window.apiService.getTrendingHashtags();
      const hashtags = response.data.hashtags || [];
      if (!hashtags.length) {
        trendingHashtagsList.innerHTML = '<div class="search-state">No trending hashtags yet.</div>';
        return;
      }
      trendingHashtagsList.innerHTML = hashtags.map((hashtag) => `
        <button class="trending-hashtag" data-trending-tag="${escapeHTML(hashtag.name)}">
          <span class="trending-hashtag-name">#${escapeHTML(hashtag.name)}</span>
          <span class="trending-hashtag-count">${hashtag.postCount} post${hashtag.postCount === 1 ? '' : 's'}</span>
        </button>
      `).join('');
      trendingHashtagsList.querySelectorAll('[data-trending-tag]').forEach((button) => {
        button.addEventListener('click', () => {
          activeTag = button.dataset.trendingTag;
          activeFilter = 'all';
          showToast(`Showing #${activeTag}`, 'info');
          loadHashtagPage(activeTag);
        });
      });
    } catch (err) {
      trendingHashtagsList.innerHTML = '<div class="search-state" style="color:var(--danger);">Unable to load trends.</div>';
    }
  };

  if (refreshSuggestedBtn) {
    refreshSuggestedBtn.addEventListener('click', loadSuggestedUsers);
  }
  loadTrendingHashtags();

  // Follow Modal Click Handlers for Profile Widget Stats
  if (statFollowers) {
    statFollowers.addEventListener('click', () => {
      if (!currentUser) return openModal(authModal);
      openFollowModal(currentUser._id, 'followers');
    });
  }

  if (statFollowing) {
    statFollowing.addEventListener('click', () => {
      if (!currentUser) return openModal(authModal);
      openFollowModal(currentUser._id, 'following');
    });
  }

  const openFollowModal = (userId, type = 'followers') => {
    currentModalTargetUserId = userId;
    activeFollowTab = type;

    if (type === 'followers') {
      tabFollowers.classList.add('active');
      tabFollowing.classList.remove('active');
      followModalTitle.textContent = 'Followers';
      followModalSubtitle.textContent = 'People following this Viber';
    } else {
      tabFollowing.classList.add('active');
      tabFollowers.classList.remove('active');
      followModalTitle.textContent = 'Following';
      followModalSubtitle.textContent = 'People this Viber is following';
    }

    openModal(followModal);
    loadFollowUserList(userId, type);
  };

  tabFollowers.addEventListener('click', () => {
    if (!currentModalTargetUserId) return;
    activeFollowTab = 'followers';
    tabFollowers.classList.add('active');
    tabFollowing.classList.remove('active');
    followModalTitle.textContent = 'Followers';
    loadFollowUserList(currentModalTargetUserId, 'followers');
  });

  tabFollowing.addEventListener('click', () => {
    if (!currentModalTargetUserId) return;
    activeFollowTab = 'following';
    tabFollowing.classList.add('active');
    tabFollowers.classList.remove('active');
    followModalTitle.textContent = 'Following';
    loadFollowUserList(currentModalTargetUserId, 'following');
  });

  const loadFollowUserList = async (userId, type) => {
    followUserList.innerHTML = '<div class="skeleton-line" style="height: 48px; margin: 0.5rem 0;"></div>';

    try {
      const response = type === 'followers'
        ? await window.apiService.getFollowers(userId)
        : await window.apiService.getFollowing(userId);

      const users = type === 'followers' ? response.data.followers : response.data.following;

      if (users.length === 0) {
        followUserList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:1.5rem 0;">No ${type} found.</p>`;
        return;
      }

      followUserList.innerHTML = '';
      users.forEach(u => {
        const avatarSrc = u.avatar ? u.avatar : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(u.name)}`;
        const row = document.createElement('div');
        row.className = 'follow-user-row';

        const isSelf = currentUser && currentUser._id === u._id;
        const followBtnHTML = isSelf
          ? '<span style="font-size:0.75rem; color:var(--text-muted);">You</span>'
          : `<div style="display:flex; gap:0.4rem;">
              <button class="btn btn-sm ${u.isFollowing ? 'btn-following' : 'btn-follow'} follow-toggle-btn" data-userid="${u._id}">
                ${u.isFollowing ? 'Following' : 'Follow'}
              </button>
              <button class="btn btn-sm btn-outline chat-direct-btn" data-userid="${u._id}" title="Message User">💬</button>
            </div>`;

        row.innerHTML = `
          <div class="suggested-user-meta">
            <img class="suggested-user-avatar" src="${avatarSrc}" alt="${u.name}">
            <div class="suggested-user-names">
              <span class="suggested-user-name">${u.name}</span>
              <span class="suggested-user-bio">${u.bio ? escapeHTML(u.bio) : 'VibeSpace Member'}</span>
            </div>
          </div>
          <div>${followBtnHTML}</div>
        `;

        const followBtn = row.querySelector('.follow-toggle-btn');
        if (followBtn) {
          followBtn.addEventListener('click', async () => {
            if (!currentUser) return openModal(authModal);
            try {
              if (u.isFollowing) {
                await window.apiService.unfollowUser(u._id);
                u.isFollowing = false;
                followBtn.className = 'btn btn-sm btn-follow follow-toggle-btn';
                followBtn.textContent = 'Follow';
                showToast(`Unfollowed ${u.name}`, 'info');
              } else {
                await window.apiService.followUser(u._id);
                u.isFollowing = true;
                followBtn.className = 'btn btn-sm btn-following follow-toggle-btn';
                followBtn.textContent = 'Following';
                showToast(`Now following ${u.name}`, 'success');
              }
              if (currentUser) fetchUserStats(currentUser._id);
              loadSuggestedUsers();
              if (activeFeedType === 'following') fetchPosts(true);
            } catch (err) {
              showToast(err.message || 'Follow action failed', 'error');
            }
          });
        }

        const chatBtn = row.querySelector('.chat-direct-btn');
        if (chatBtn) {
          chatBtn.addEventListener('click', () => {
            closeModal(followModal);
            openChatModal(u._id);
          });
        }

        followUserList.appendChild(row);
      });
    } catch (err) {
      followUserList.innerHTML = `<p style="font-size:0.85rem; color:var(--danger); text-align:center;">Failed to load ${type}.</p>`;
    }
  };

  // ==========================================
  // Real-Time Socket.IO Chat Implementation
  // ==========================================

  const initSocketConnection = () => {
    if (!window.io || !currentUser) return;

    if (socket) {
      socket.disconnect();
    }

    const token = window.apiService.getAccessToken();
    if (!token) return;

    socket = io(window.location.origin, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to VibeSpace Chat');
    });

    socket.on('online_users', (users) => {
      onlineUserIds = new Set(users);
      updateOnlineIndicators();
    });

    socket.on('new_message', (msg) => {
      if (activeConversationId && msg.conversation === activeConversationId) {
        appendSingleMessage(msg);
        scrollToBottomMessages();
      }
      loadConversations();
    });

    socket.on('new_message_notification', (msg) => {
      showToast(`💬 New message from ${msg.sender ? msg.sender.name : 'a Viber'}: "${msg.content.substring(0, 30)}..."`, 'info');
      loadConversations();
    });

    socket.on('new_notification', () => {
      loadNotifications();
    });

    socket.on('user_typing', ({ userId, conversationId }) => {
      if (activeConversationId === conversationId && userId !== currentUser._id) {
        chatTypingIndicator.style.display = 'block';
        chatTypingIndicator.textContent = `${activeRecipientUser ? activeRecipientUser.name : 'Viber'} is typing...`;
      }
    });

    socket.on('user_stop_typing', ({ userId, conversationId }) => {
      if (activeConversationId === conversationId && userId !== currentUser._id) {
        chatTypingIndicator.style.display = 'none';
      }
    });
  };

  const updateOnlineIndicators = () => {
    // Update active chat recipient online indicator
    if (activeRecipientId) {
      const isOnline = onlineUserIds.has(activeRecipientId);
      if (chatRecipientStatus) {
        chatRecipientStatus.className = `status-indicator ${isOnline ? 'status-online' : ''}`;
      }
      if (chatRecipientSub) {
        chatRecipientSub.textContent = isOnline ? 'Online' : 'Offline';
      }
    }

    // Update conversation list online indicators
    document.querySelectorAll('.conversation-item').forEach(item => {
      const recipientId = item.dataset.recipientid;
      const statusDot = item.querySelector('.status-indicator');
      if (statusDot && recipientId) {
        const isOnline = onlineUserIds.has(recipientId);
        statusDot.className = `status-indicator ${isOnline ? 'status-online' : ''}`;
      }
    });
  };

  const openChatModal = (targetUserId = null) => {
    if (!currentUser) return openModal(authModal);
    openModal(chatModal);
    loadConversations();

    if (targetUserId) {
      startConversationWithUser(targetUserId);
    }
  };

  if (navMessages) {
    navMessages.addEventListener('click', (e) => {
      e.preventDefault();
      openChatModal();
    });
  }

  if (mobileNavMessages) {
    mobileNavMessages.addEventListener('click', (e) => {
      e.preventDefault();
      openChatModal();
    });
  }

  const startConversationWithUser = async (recipientId) => {
    try {
      const response = await window.apiService.createOrGetConversation(recipientId);
      const conv = response.data.conversation;
      await loadConversations();
      selectConversation(conv);
    } catch (err) {
      showToast(err.message || 'Failed to start conversation', 'error');
    }
  };

  const loadConversations = async () => {
    if (!conversationsList) return;
    try {
      const response = await window.apiService.getConversations();
      const conversations = response.data.conversations || [];

      let totalUnread = 0;
      conversations.forEach(c => totalUnread += (c.unreadCount || 0));

      if (navUnreadBadge) {
        navUnreadBadge.textContent = totalUnread;
        navUnreadBadge.style.display = totalUnread > 0 ? 'inline-block' : 'none';
      }

      if (conversations.length === 0) {
        conversationsList.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1.5rem 0;">No active messages yet.</p>';
        return;
      }

      conversationsList.innerHTML = '';
      conversations.forEach(conv => {
        const recipient = conv.participants.find(p => p._id !== currentUser._id) || conv.participants[0];
        const recipientId = recipient ? recipient._id : '';
        const recipientName = recipient ? recipient.name : 'Unknown User';
        const recipientAvatar = (recipient && recipient.avatar)
          ? recipient.avatar
          : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(recipientName)}`;

        const isOnline = onlineUserIds.has(recipientId);
        const lastMsgText = conv.lastMessage ? escapeHTML(conv.lastMessage.content) : 'No messages yet';
        const lastMsgTime = conv.lastMessage ? formatTimeAgo(conv.lastMessage.createdAt) : '';

        const item = document.createElement('div');
        item.className = `conversation-item ${activeConversationId === conv._id ? 'active' : ''}`;
        item.dataset.id = conv._id;
        item.dataset.recipientid = recipientId;

        item.innerHTML = `
          <div class="avatar-status-wrapper">
            <img class="chat-recipient-avatar" src="${recipientAvatar}" alt="${recipientName}">
            <span class="status-indicator ${isOnline ? 'status-online' : ''}"></span>
          </div>
          <div class="conversation-info">
            <div class="conversation-top">
              <span class="conversation-name">${recipientName}</span>
              <span class="conversation-time">${lastMsgTime}</span>
            </div>
            <div class="conversation-preview">${lastMsgText}</div>
          </div>
          ${conv.unreadCount > 0 ? `<span class="badge-unread-count">${conv.unreadCount}</span>` : ''}
        `;

        item.addEventListener('click', () => {
          selectConversation(conv);
        });

        conversationsList.appendChild(item);
      });
    } catch (err) {
      console.error('Error loading conversations:', err.message);
    }
  };

  const selectConversation = async (conv) => {
    activeConversationId = conv._id;
    const recipient = conv.participants.find(p => p._id !== currentUser._id) || conv.participants[0];
    activeRecipientId = recipient ? recipient._id : null;
    activeRecipientUser = recipient;

    // Join Socket Room
    if (socket && socket.connected) {
      socket.emit('join_conversation', conv._id);
    }

    // Highlight conversation list item
    document.querySelectorAll('.conversation-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === conv._id);
    });

    // Update Header UI
    chatPlaceholder.style.display = 'none';
    chatHeader.style.display = 'flex';
    chatMessagesContainer.style.display = 'flex';
    chatMessageForm.style.display = 'flex';

    if (recipient) {
      chatRecipientAvatar.src = recipient.avatar ? recipient.avatar : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(recipient.name)}`;
      chatRecipientName.textContent = recipient.name;
      const isOnline = onlineUserIds.has(recipient._id);
      chatRecipientStatus.className = `status-indicator ${isOnline ? 'status-online' : ''}`;
      chatRecipientSub.textContent = isOnline ? 'Online' : 'Offline';
    }

    // Fetch Messages History
    try {
      chatMessagesContainer.innerHTML = '<div class="skeleton-line" style="height:30px; width:40%; margin:0.5rem 0;"></div>';
      const response = await window.apiService.getMessages(conv._id);
      const messages = response.data.messages || [];

      chatMessagesContainer.innerHTML = '';
      messages.forEach(msg => appendSingleMessage(msg));
      scrollToBottomMessages();
      loadConversations(); // refresh unread counters
    } catch (err) {
      chatMessagesContainer.innerHTML = `<p style="color:var(--danger); font-size:0.85rem;">Failed to load messages</p>`;
    }
  };

  const appendSingleMessage = (msg) => {
    if (!chatMessagesContainer) return;
    const isSent = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
    const timeFormatted = formatTimeAgo(msg.createdAt);

    const wrapper = document.createElement('div');
    wrapper.className = `message-bubble-wrapper ${isSent ? 'sent' : 'received'}`;
    wrapper.innerHTML = `
      <div class="message-bubble">${escapeHTML(msg.content)}</div>
      <span class="message-time">${timeFormatted}</span>
    `;

    chatMessagesContainer.appendChild(wrapper);
  };

  const scrollToBottomMessages = () => {
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  };

  // Message Form Submit Handler
  if (chatMessageForm) {
    chatMessageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = chatInputField.value.trim();
      if (!content || !activeConversationId) return;

      chatInputField.value = '';

      if (socket && socket.connected && activeRecipientId) {
        socket.emit('send_message', {
          conversationId: activeConversationId,
          recipientId: activeRecipientId,
          content
        });
        socket.emit('stop_typing', {
          conversationId: activeConversationId,
          recipientId: activeRecipientId
        });
      } else {
        // Fallback to REST API
        try {
          const res = await window.apiService.sendMessage(activeConversationId, content);
          appendSingleMessage(res.data.message);
          scrollToBottomMessages();
          loadConversations();
        } catch (err) {
          showToast(err.message || 'Failed to send message', 'error');
        }
      }
    });

    // Typing Event Emission
    chatInputField.addEventListener('input', () => {
      if (!socket || !socket.connected || !activeConversationId || !activeRecipientId) return;

      socket.emit('typing', {
        conversationId: activeConversationId,
        recipientId: activeRecipientId
      });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('stop_typing', {
          conversationId: activeConversationId,
          recipientId: activeRecipientId
        });
      }, 1500);
    });
  }

  // ==========================================
  // Feed Switcher Logic (Global vs Following)
  // ==========================================
  const setFeedSwitcherActive = (feedType) => {
    activeFeedType = feedType;
    if (feedTabGlobal && feedTabFollowing) {
      if (feedType === 'global') {
        feedTabGlobal.classList.add('active');
        feedTabFollowing.classList.remove('active');
      } else {
        feedTabFollowing.classList.add('active');
        feedTabGlobal.classList.remove('active');
      }
    }
  };

  if (feedTabGlobal) {
    feedTabGlobal.addEventListener('click', () => {
      setFeedSwitcherActive('global');
      fetchPosts(true);
    });
  }

  if (feedTabFollowing) {
    feedTabFollowing.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please log in to view your personalized Following feed.', 'info');
        openModal(authModal);
        return;
      }
      setFeedSwitcherActive('following');
      fetchPosts(true);
    });
  }

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
      showToast('Vibe published!', 'success');
      fetchPosts(true);
      if (currentUser) fetchUserStats(currentUser._id);
    } catch (err) {
      showToast(err.message || 'Failed to publish post', 'error');
    }
  });

  // ==========================================
  // Skeleton Loader Helper
  // ==========================================
  const renderSkeletonLoaders = (count = 3) => {
    let skeletonsHTML = '';
    for (let i = 0; i < count; i++) {
      skeletonsHTML += `
        <div class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-meta">
              <div class="skeleton-line" style="width: 40%;"></div>
              <div class="skeleton-line" style="width: 25%;"></div>
            </div>
          </div>
          <div class="skeleton-line" style="width: 90%; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 70%;"></div>
        </div>
      `;
    }
    postsStream.innerHTML = skeletonsHTML;
  };

  // ==========================================
  // Posts Feed & Filtering Logic
  // ==========================================
  const fetchPosts = async (reset = false) => {
    if (isLoadingPosts) return;
    isLoadingPosts = true;

    if (reset) {
      currentPage = 1;
      renderSkeletonLoaders(3);
    }

    try {
      let endpoint = `/posts?page=${currentPage}&limit=5&sortBy=${activeSort}&feedType=${activeFeedType}`;
      
      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }

      if (activeTag) {
        endpoint += `&tag=${encodeURIComponent(activeTag)}`;
      }

      if (activeFilter === 'myposts' && currentUser) {
        endpoint += `&author=${currentUser._id}`;
        feedStatusText.textContent = 'My Posts Feed';
      } else if (activeFilter === 'frozen') {
        endpoint += `&isFrozen=true`;
        feedStatusText.textContent = 'Frozen Feed';
      } else {
        const feedLabel = activeFeedType === 'following' ? 'Following Feed 👥' : 'Global Feed 🌐';
        feedStatusText.textContent = activeTag ? `Tag: #${activeTag}` : (searchQuery ? `Search: "${searchQuery}"` : feedLabel);
      }

      const response = await window.apiService.get(endpoint);
      const { posts, pagination } = response.data;

      hasMorePosts = pagination.hasMore;
      loadMoreBtn.style.display = hasMorePosts ? 'inline-block' : 'none';

      if (reset) {
        postsStream.innerHTML = '';
      }

      if (posts.length === 0 && currentPage === 1) {
        if (activeFeedType === 'following') {
          postsStream.innerHTML = `
            <div class="card empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              <h3>Your Following Feed is quiet</h3>
              <p style="margin-bottom: 1rem;">Follow more vibers to personalize your feed or explore community posts.</p>
              <button class="btn btn-sm btn-primary" id="empty-switch-global-btn">Explore Global Feed 🌐</button>
            </div>
          `;

          const emptyBtn = document.getElementById('empty-switch-global-btn');
          if (emptyBtn) {
            emptyBtn.addEventListener('click', () => {
              setFeedSwitcherActive('global');
              fetchPosts(true);
            });
          }
        } else {
          postsStream.innerHTML = `
            <div class="card empty-state">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
              <h3>No vibes found</h3>
              <p>Be the first to start a vibe in the VibeSpace community!</p>
            </div>
          `;
        }
      } else {
        posts.forEach(post => {
          postsStream.appendChild(renderPostCard(post));
        });
      }
    } catch (err) {
      postsStream.innerHTML = `
        <div class="card empty-state" style="color: var(--danger);">
          <p>Error loading VibeSpace feed: ${err.message}</p>
        </div>
      `;
    } finally {
      isLoadingPosts = false;
    }
  };

  const loadHashtagPage = async (tag, sort = hashtagSort, page = 1) => {
    const normalizedTag = tag.replace(/^#/, '').toLowerCase();
    activeTag = normalizedTag;
    hashtagSort = sort;
    hashtagPage = page;
    hashtagPageHeader.style.display = 'flex';
    hashtagPageTitle.textContent = `#${normalizedTag}`;
    postsStream.innerHTML = '<div class="card search-state">Loading hashtag posts...</div>';
    hashtagLoadMore.style.display = 'none';
    try {
      const response = await window.apiService.getHashtagPosts(normalizedTag, page, sort);
      const { posts, pagination, total } = response.data;
      hashtagPageCount.textContent = `${total} post${total === 1 ? '' : 's'}`;
      postsStream.innerHTML = '';
      if (!posts.length) {
        postsStream.innerHTML = '<div class="card empty-state"><h3>No posts for this hashtag yet</h3><p>Be the first to use it.</p></div>';
      } else {
        posts.forEach((post) => postsStream.appendChild(renderPostCard(post)));
      }
      hashtagLoadMore.style.display = pagination.hasMore ? 'inline-block' : 'none';
      hashtagRecentBtn.className = `btn btn-sm ${sort === 'recent' ? 'btn-primary' : 'btn-outline'}`;
      hashtagPopularBtn.className = `btn btn-sm ${sort === 'popular' ? 'btn-primary' : 'btn-outline'}`;
    } catch (err) {
      postsStream.innerHTML = `<div class="card empty-state" style="color:var(--danger);">${escapeHTML(err.message || 'Failed to load hashtag posts.')}</div>`;
    }
  };

  hashtagRecentBtn.addEventListener('click', () => loadHashtagPage(activeTag, 'recent'));
  hashtagPopularBtn.addEventListener('click', () => loadHashtagPage(activeTag, 'popular'));
  hashtagLoadMore.addEventListener('click', async () => {
    const response = await window.apiService.getHashtagPosts(activeTag, hashtagPage + 1, hashtagSort);
    hashtagPage += 1;
    response.data.posts.forEach((post) => postsStream.appendChild(renderPostCard(post)));
    hashtagLoadMore.style.display = response.data.pagination.hasMore ? 'inline-block' : 'none';
  });

  // Helper function to format relative timestamps
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderSearchResults = (data) => {
    const users = data.users || [];
    const posts = data.posts || [];
    const hashtags = data.hashtags || [];
    const sections = [];

    if (activeSearchType === 'all' || activeSearchType === 'users') {
      sections.push(`<div class="search-section-title">People</div>`);
      if (users.length) {
        sections.push(users.map((user) => {
          const avatar = user.avatar || `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(user.name)}`;
          return `
            <div class="search-user-result" data-search-user="${user._id}">
              <img src="${avatar}" alt="">
              <span class="search-result-meta"><strong>${escapeHTML(user.name)}</strong><span>${user.isFollowing ? 'Following' : 'VibeSpace member'}</span></span>
              ${currentUser && currentUser._id !== user._id ? `
                <button class="btn btn-sm ${user.isFollowing ? 'btn-secondary' : 'btn-primary'} search-follow-btn" data-search-follow="${user._id}" data-following="${user.isFollowing}">
                  ${user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button class="btn btn-sm btn-outline search-chat-btn" data-search-chat="${user._id}">Chat</button>
              ` : ''}
            </div>
          `;
        }).join(''));
      } else {
        sections.push('<div class="search-state">No people found.</div>');
      }
    }

    if (activeSearchType === 'all' || activeSearchType === 'hashtags') {
      sections.push(`<div class="search-section-title">Hashtags</div>`);
      if (hashtags.length) {
        sections.push(hashtags.map((tag) => `
          <button class="search-hashtag-result" data-search-tag="${escapeHTML(tag.name)}">
            <span class="search-result-meta"><strong>#${escapeHTML(tag.name)}</strong><span>${tag.postCount} post${tag.postCount === 1 ? '' : 's'}</span></span>
          </button>
        `).join(''));
      } else {
        sections.push('<div class="search-state">No hashtags found.</div>');
      }
    }

    if (activeSearchType === 'all' || activeSearchType === 'posts') {
      sections.push(`<div class="search-section-title">Posts</div>`);
      if (posts.length) {
      } else {
        sections.push('<div class="search-state">No posts found.</div>');
      }
    }

    const pagination = data[`${activeSearchType === 'users' ? 'users' : activeSearchType === 'posts' ? 'posts' : 'hashtags'}Pagination`]
      || data.usersPagination || data.postsPagination || data.hashtagsPagination;
    if (pagination && pagination.hasMore) {
      sections.push('<button class="btn btn-sm btn-outline search-load-more" type="button">Load more results</button>');
    }
    searchResultsBody.innerHTML = sections.join('');
    if (posts.length && (activeSearchType === 'all' || activeSearchType === 'posts')) {
      posts.forEach((post) => searchResultsBody.appendChild(renderPostCard(post)));
    }

    searchResultsBody.querySelectorAll('[data-search-user]').forEach((item) => {
      item.addEventListener('click', (event) => {
        if (!event.target.closest('button')) {
          openFollowModal(item.dataset.searchUser, 'followers');
        }
      });
    });
    searchResultsBody.querySelectorAll('[data-search-follow]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (!currentUser) return openModal(authModal);
        const userId = button.dataset.searchFollow;
        const isFollowing = button.dataset.following === 'true';
        try {
          if (isFollowing) {
            await window.apiService.unfollowUser(userId);
          } else {
            await window.apiService.followUser(userId);
          }
          const user = (activeSearchData.users || []).find((item) => item._id === userId);
          if (user) user.isFollowing = !isFollowing;
          renderSearchResults(activeSearchData);
          showToast(isFollowing ? 'Unfollowed user.' : 'User followed successfully.', 'success');
          if (activeFeedType === 'following') fetchPosts(true);
        } catch (err) {
          showToast(err.message || 'Unable to update follow state.', 'error');
        }
      });
    });
    searchResultsBody.querySelectorAll('[data-search-chat]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!currentUser) return openModal(authModal);
        openChatModal(button.dataset.searchChat);
      });
    });
    searchResultsBody.querySelectorAll('[data-search-tag]').forEach((item) => {
      item.addEventListener('click', () => {
        searchInput.value = `#${item.dataset.searchTag}`;
        activeSearchQuery = item.dataset.searchTag;
        searchGlobalResults();
      });
    });
    const loadMoreButton = searchResultsBody.querySelector('.search-load-more');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => searchGlobalResults(activeSearchPage + 1));
    }
  };

  const renderHashtagContent = (content) => escapeHTML(content).replace(
    /#([A-Za-z0-9_]{1,50})/g,
    '<a href="#" class="inline-hashtag" data-inline-tag="$1">#$1</a>'
  );

  const searchGlobalResults = async (page = 1) => {
    const query = activeSearchQuery.replace(/^#/, '').trim();
    if (query.length < 2) return;
    searchResultsPanel.style.display = 'block';
    searchResultsBody.innerHTML = '<div class="search-state">Searching...</div>';
    try {
      const response = await window.apiService.search(query, activeSearchType, page, 10);
      if (page === 1) {
        activeSearchData = response.data;
      } else {
        activeSearchData = {
          ...activeSearchData,
          users: [...(activeSearchData.users || []), ...(response.data.users || [])],
          posts: [...(activeSearchData.posts || []), ...(response.data.posts || [])],
          hashtags: [...(activeSearchData.hashtags || []), ...(response.data.hashtags || [])],
          usersPagination: response.data.usersPagination || activeSearchData.usersPagination,
          postsPagination: response.data.postsPagination || activeSearchData.postsPagination,
          hashtagsPagination: response.data.hashtagsPagination || activeSearchData.hashtagsPagination
        };
      }
      activeSearchPage = page;
      renderSearchResults(activeSearchData);
    } catch (err) {
      searchResultsBody.innerHTML = `<div class="search-state" style="color:var(--danger);">${escapeHTML(err.message || 'Search failed.')}</div>`;
    }
  };

  // Render Post Card Component
  const renderPostCard = (post) => {
    const card = document.createElement('article');
    card.className = 'card post-card';
    card.dataset.id = post._id;
    const authorId = post.author._id || post.author;
    card.dataset.authorId = authorId;

    const isOwner = currentUser && currentUser._id.toString() === authorId.toString();
    const reactionEmoji = { like: '❤️', haha: '😂', sad: '😢', angry: '😡', wow: '😮' };
    const currentReaction = post.myReaction || null;
    const reactionSummary = Object.entries(post.reactionCounts || {})
      .filter(([, count]) => count > 0)
      .map(([type, count]) => `${reactionEmoji[type]} ${count}`)
      .join(' ');
    const authorName = post.author ? post.author.name : 'Unknown Viber';
    const authorAvatar = (post.author && post.author.avatar)
      ? post.author.avatar
      : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(authorName)}`;

    const dateFormatted = formatTimeAgo(post.createdAt);

    const tagsHTML = post.tags && post.tags.length > 0
      ? post.tags.map(t => `<span class="tag-badge" data-tag="${t}">#${t}</span>`).join('')
      : '';

    card.innerHTML = `
      <div class="post-header">
        <div class="post-author-info">
          <img class="author-avatar" src="${authorAvatar}" alt="${authorName}" data-authorid="${authorId}">
          <div class="author-meta">
            <span class="author-name" data-authorid="${authorId}">${authorName}</span>
            <span class="post-timestamp">${dateFormatted}</span>
          </div>
        </div>
        <div class="post-badges">
          ${post.isFrozen ? `<span class="badge-frozen">❄️ Frozen</span>` : ''}
          ${!isOwner ? `
            <button class="btn btn-sm ${post.isFollowing ? 'btn-secondary' : 'btn-primary'} post-follow-btn" data-authorid="${authorId}" data-following="${post.isFollowing === true}">
              ${post.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            <button class="btn btn-sm btn-outline direct-chat-trigger-btn" data-authorid="${authorId}">💬 Chat</button>
          ` : ''}
          ${isOwner ? `
            <button class="btn btn-sm btn-secondary freeze-btn ${post.isFrozen ? 'btn-danger' : ''}" title="${post.isFrozen ? 'Unfreeze Post' : 'Freeze Post'}">
              ${post.isFrozen ? 'Unfreeze 🔓' : 'Freeze ❄️'}
            </button>
            <button class="btn btn-sm btn-outline delete-btn" title="Delete Post">🗑️</button>
          ` : ''}
        </div>
      </div>

      <div class="post-content">${renderHashtagContent(post.content)}</div>
      
      ${tagsHTML ? `<div class="post-tags">${tagsHTML}</div>` : ''}

      <div class="post-actions">
        <div class="reaction-control">
          <button class="action-btn reaction-trigger ${currentReaction ? 'reacted' : ''}" ${post.isFrozen ? 'disabled' : ''}>
            <span class="reaction-trigger-emoji">${currentReaction ? reactionEmoji[currentReaction] : '♡'}</span>
            <span class="reaction-total">${post.totalReactions || 0}</span>
          </button>
          <div class="reaction-picker" hidden>
            ${Object.entries(reactionEmoji).map(([type, emoji]) => `<button type="button" class="reaction-option ${currentReaction === type ? 'selected' : ''}" data-reaction="${type}" aria-label="${type}">${emoji}</button>`).join('')}
          </div>
          <div class="reaction-summary">${reactionSummary}</div>
        </div>
        <!--
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="like-count">${post.likeCount || 0}</span>
        </button>
        -->

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
          <!-- Comments loaded dynamically -->
        </div>
      </div>
    `;

    // Click Author Avatar or Name to open Followers/Following Modal for that User
    card.querySelectorAll('[data-authorid]').forEach(el => {
      if (!el.classList.contains('direct-chat-trigger-btn')) {
        el.addEventListener('click', () => {
          openFollowModal(authorId, 'followers');
        });
      }
    });

    // Direct Chat Trigger Button on Post Header
    const directChatBtn = card.querySelector('.direct-chat-trigger-btn');
    if (directChatBtn) {
      directChatBtn.addEventListener('click', () => {
        openChatModal(authorId);
      });
    }

    const followBtn = card.querySelector('.post-follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (!currentUser) return openModal(authModal);
        const isFollowing = followBtn.dataset.following === 'true';
        followBtn.disabled = true;
        try {
          if (isFollowing) {
            await window.apiService.unfollowUser(authorId);
          } else {
            await window.apiService.followUser(authorId);
          }
          post.isFollowing = !isFollowing;
          followBtn.dataset.following = String(post.isFollowing);
          followBtn.textContent = post.isFollowing ? 'Unfollow' : 'Follow';
          followBtn.className = `btn btn-sm ${post.isFollowing ? 'btn-secondary' : 'btn-primary'} post-follow-btn`;
          showToast(post.isFollowing ? 'User followed successfully.' : 'User unfollowed.', 'success');
          if (activeFeedType === 'following') fetchPosts(true);
        } catch (err) {
          showToast(err.message || 'Unable to update follow state.', 'error');
        } finally {
          followBtn.disabled = false;
        }
      });
    }

    const reactionControl = card.querySelector('.reaction-control');
    const reactionTrigger = card.querySelector('.reaction-trigger');
    const reactionPicker = card.querySelector('.reaction-picker');
    const updateReactionUI = () => {
      const activeReaction = post.myReaction;
      reactionTrigger.classList.toggle('reacted', !!activeReaction);
      reactionTrigger.querySelector('.reaction-trigger-emoji').textContent =
        activeReaction ? reactionEmoji[activeReaction] : '♡';
      reactionTrigger.querySelector('.reaction-total').textContent = post.totalReactions || 0;
      card.querySelector('.reaction-summary').textContent = Object.entries(post.reactionCounts || {})
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${reactionEmoji[type]} ${count}`)
        .join(' ');
      card.querySelectorAll('.reaction-option').forEach((option) => {
        option.classList.toggle('selected', option.dataset.reaction === activeReaction);
      });
    };

    reactionTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!currentUser) return openModal(authModal);
      reactionPicker.hidden = !reactionPicker.hidden;
    });

    reactionControl.querySelectorAll('.reaction-option').forEach((option) => {
      option.addEventListener('click', async (event) => {
        event.stopPropagation();
        const previousState = {
          myReaction: post.myReaction,
          totalReactions: post.totalReactions,
          reactionCounts: { ...(post.reactionCounts || {}) }
        };
        const nextReaction = post.myReaction === option.dataset.reaction ? null : option.dataset.reaction;
        if (post.myReaction) {
          post.reactionCounts[post.myReaction] = Math.max(0, post.reactionCounts[post.myReaction] - 1);
        }
        if (nextReaction) {
          post.reactionCounts[nextReaction] = (post.reactionCounts[nextReaction] || 0) + 1;
        }
        post.totalReactions = (post.totalReactions || 0) + (nextReaction ? 1 : 0) - (previousState.myReaction ? 1 : 0);
        post.myReaction = nextReaction;
        updateReactionUI();
        reactionPicker.hidden = true;
        try {
          const response = await window.apiService.reactToPost(post._id, nextReaction);
          post.myReaction = response.data.myReaction;
          post.totalReactions = response.data.totalReactions;
          post.reactionCounts = response.data.reactionCounts;
          updateReactionUI();
        } catch (err) {
          post.myReaction = previousState.myReaction;
          post.totalReactions = previousState.totalReactions;
          post.reactionCounts = previousState.reactionCounts;
          updateReactionUI();
          showToast(err.message || 'Failed to update reaction', 'error');
        }
      });
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
        const confirmed = await showConfirmModal({
          title: 'Delete Vibe',
          message: 'Are you sure you want to delete this vibe? This action cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        });
        if (!confirmed) return;
        try {
          await window.apiService.delete(`/posts/${post._id}`);
          showToast('Vibe deleted', 'info');
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

    const submitTopComment = async () => {
      const content = commentInput.value.trim();
      if (!content) {
        showToast('Comment content cannot be empty', 'warning');
        return;
      }
      try {
        sendCommentBtn.disabled = true;
        const res = await window.apiService.createComment(post._id, content);
        commentInput.value = '';
        card.querySelector('.comment-count').textContent = res.data.commentCount;
        loadComments(post._id, commentsList, card, 1);
        showToast('Comment posted successfully', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to post comment', 'error');
      } finally {
        sendCommentBtn.disabled = post.isFrozen || !currentUser;
      }
    };

    sendCommentBtn.addEventListener('click', submitTopComment);
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitTopComment();
      }
    });

    // Tag Filter Clicks
    card.querySelectorAll('.tag-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        activeTag = e.target.dataset.tag;
        showToast(`Filtering by tag: #${activeTag}`, 'info');
        loadHashtagPage(activeTag);
      });
    });
    card.querySelectorAll('.inline-hashtag').forEach((hashtag) => {
      hashtag.addEventListener('click', (event) => {
        event.preventDefault();
        activeTag = hashtag.dataset.inlineTag.toLowerCase();
        activeFilter = 'all';
        showToast(`Showing #${activeTag}`, 'info');
        loadHashtagPage(activeTag);
      });
    });

    return card;
  };

  // Helper Confirmation Modal
  const showConfirmModal = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-dialog-modal');
      const titleEl = document.getElementById('confirm-modal-title');
      const descEl = document.getElementById('confirm-modal-desc');
      const cancelBtn = document.getElementById('confirm-modal-cancel');
      const submitBtn = document.getElementById('confirm-modal-submit');

      if (!modal) {
        resolve(window.confirm(message));
        return;
      }

      titleEl.textContent = title || 'Confirmation';
      descEl.textContent = message || 'Are you sure?';
      cancelBtn.textContent = cancelText;
      submitBtn.textContent = confirmText;

      const cleanup = () => {
        modal.classList.remove('active');
        cancelBtn.removeEventListener('click', onCancel);
        submitBtn.removeEventListener('click', onSubmit);
        modal.removeEventListener('click', onBackdrop);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onSubmit = () => {
        cleanup();
        resolve(true);
      };

      const onBackdrop = (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      };

      cancelBtn.addEventListener('click', onCancel);
      submitBtn.addEventListener('click', onSubmit);
      modal.addEventListener('click', onBackdrop);

      modal.classList.add('active');
    });
  };

  // Advanced Comment System Handler (Phase 5)
  const loadComments = async (postId, container, postCard, page = 1) => {
    if (page === 1) {
      container.innerHTML = `
        <div class="comment-skeleton">
          <div class="skeleton-avatar" style="width:30px; height:30px; border-radius:50%; background:var(--border-color);"></div>
          <div style="flex:1;">
            <div class="skeleton-line" style="height:12px; width:40%; margin-bottom:6px; background:var(--border-color); border-radius:4px;"></div>
            <div class="skeleton-line" style="height:14px; width:80%; background:var(--border-color); border-radius:4px;"></div>
          </div>
        </div>
      `;
    }

    try {
      const response = await window.apiService.getPostComments(postId, page, 10);
      const { comments, pagination } = response.data;

      if (page === 1) {
        container.innerHTML = '';
      } else {
        const existingLoadMore = container.querySelector('.load-more-comments-btn');
        if (existingLoadMore) existingLoadMore.remove();
      }

      if (comments.length === 0 && page === 1) {
        container.innerHTML = `
          <div class="comment-empty-state">
            <span style="font-size: 1.2rem;">💬</span>
            <p style="margin-top: 0.2rem;">No comments yet. Start the conversation!</p>
          </div>
        `;
        return;
      }

      comments.forEach(comment => {
        const commentEl = renderSingleCommentElement(comment, postId, postCard);
        container.appendChild(commentEl);
      });

      if (pagination && pagination.hasMore) {
        const remaining = pagination.totalComments - (page * pagination.limit);
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-comments-btn';
        loadMoreBtn.textContent = `Load more comments (${remaining > 0 ? remaining : ''} remaining)...`;
        loadMoreBtn.addEventListener('click', () => {
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = 'Loading...';
          loadComments(postId, container, postCard, page + 1);
        });
        container.appendChild(loadMoreBtn);
      }
    } catch (err) {
      if (page === 1) {
        container.innerHTML = `<p style="color:var(--danger); font-size:0.8rem; text-align:center; padding:0.5rem 0;">Failed to load comments. <a href="#" class="retry-comments-link" style="color:var(--primary); text-decoration:underline;">Retry</a></p>`;
        const retryLink = container.querySelector('.retry-comments-link');
        if (retryLink) {
          retryLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadComments(postId, container, postCard, 1);
          });
        }
      } else {
        showToast(err.message || 'Failed to load more comments', 'error');
      }
    }
  };

  const renderSingleCommentElement = (comment, postId, postCard, isReply = false) => {
    const commentEl = document.createElement('div');
    commentEl.className = isReply ? 'reply-item' : 'comment-item';
    commentEl.dataset.commentId = comment._id;

    const authorName = comment.author ? comment.author.name : 'VibeUser';
    const authorAvatar = (comment.author && comment.author.avatar)
      ? comment.author.avatar
      : `${window.CONFIG.DEFAULT_AVATAR}${encodeURIComponent(authorName)}`;

    const commentAuthorId = comment.author ? (comment.author._id || comment.author) : null;
    const postAuthorId = postCard ? postCard.dataset.authorId : null;

    const isCommentAuthor = currentUser && commentAuthorId && currentUser._id === commentAuthorId;
    const isPostAuthor = currentUser && postAuthorId && currentUser._id === postAuthorId;
    const canDelete = isCommentAuthor || isPostAuthor;
    const canEdit = isCommentAuthor;

    commentEl.innerHTML = `
      <img class="${isReply ? 'reply-avatar' : 'comment-avatar'}" src="${authorAvatar}" alt="${authorName}">
      <div class="comment-content-box">
        <div class="comment-header">
          <div class="comment-author-info">
            <span class="comment-author-name">${escapeHTML(authorName)}</span>
            <span class="comment-timestamp">${formatTimeAgo(comment.createdAt)}</span>
            ${comment.isEdited ? '<span class="comment-edited-tag">(edited)</span>' : ''}
          </div>
        </div>
        <div class="comment-text-body">
          <div class="comment-text">${escapeHTML(comment.content)}</div>
        </div>
        <div class="comment-actions">
          <button class="comment-action-btn like-btn ${comment.isLiked ? 'liked' : ''}">
            <span class="heart-icon">${comment.isLiked ? '❤️' : '🤍'}</span>
            <span class="like-count">${comment.likeCount || 0}</span>
          </button>
          ${currentUser && !isReply ? `<button class="comment-action-btn reply-btn">💬 Reply</button>` : ''}
          ${canEdit ? `<button class="comment-action-btn edit-btn">✏️ Edit</button>` : ''}
          ${canDelete ? `<button class="comment-action-btn delete-btn">🗑️ Delete</button>` : ''}
        </div>
        ${!isReply && comment.replyCount > 0 ? `
          <button class="view-replies-btn">
            <span>💬 View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        ` : ''}
        <div class="comment-replies-container" style="display: none;"></div>
        <div class="inline-reply-box" style="display: none;"></div>
      </div>
    `;

    // 1. Toggle Comment Like
    const likeBtn = commentEl.querySelector('.like-btn');
    likeBtn.addEventListener('click', async () => {
      if (!currentUser) {
        showToast('Please log in to like comments', 'warning');
        return;
      }
      try {
        const res = await window.apiService.toggleLikeComment(comment._id);
        const { isLiked, likeCount } = res.data;
        likeBtn.classList.toggle('liked', isLiked);
        likeBtn.querySelector('.heart-icon').textContent = isLiked ? '❤️' : '🤍';
        likeBtn.querySelector('.like-count').textContent = likeCount;
      } catch (err) {
        showToast(err.message || 'Failed to update like status', 'error');
      }
    });

    // 2. Edit Comment (Inline)
    if (canEdit) {
      const editBtn = commentEl.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        const textBody = commentEl.querySelector('.comment-text-body');
        const currentContent = comment.content;

        textBody.innerHTML = `
          <div class="inline-form-box">
            <textarea class="edit-comment-input">${escapeHTML(currentContent)}</textarea>
            <div class="inline-form-actions">
              <button class="btn btn-sm btn-secondary cancel-edit-btn">Cancel</button>
              <button class="btn btn-sm btn-primary save-edit-btn">Save</button>
            </div>
          </div>
        `;

        const textarea = textBody.querySelector('.edit-comment-input');
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);

        textBody.querySelector('.cancel-edit-btn').addEventListener('click', () => {
          textBody.innerHTML = `<div class="comment-text">${escapeHTML(comment.content)}</div>`;
        });

        textBody.querySelector('.save-edit-btn').addEventListener('click', async () => {
          const newContent = textarea.value.trim();
          if (!newContent) {
            showToast('Comment content cannot be empty', 'warning');
            return;
          }
          if (newContent === comment.content) {
            textBody.innerHTML = `<div class="comment-text">${escapeHTML(comment.content)}</div>`;
            return;
          }

          try {
            const res = await window.apiService.updateComment(comment._id, newContent);
            comment.content = res.data.comment.content;
            comment.isEdited = true;
            textBody.innerHTML = `<div class="comment-text">${escapeHTML(comment.content)}</div>`;
            
            const authorInfo = commentEl.querySelector('.comment-author-info');
            if (!authorInfo.querySelector('.comment-edited-tag')) {
              const editedSpan = document.createElement('span');
              editedSpan.className = 'comment-edited-tag';
              editedSpan.textContent = '(edited)';
              authorInfo.appendChild(editedSpan);
            }
            showToast('Comment updated', 'success');
          } catch (err) {
            showToast(err.message || 'Failed to update comment', 'error');
          }
        });
      });
    }

    // 3. Delete Comment with Confirmation
    if (canDelete) {
      const deleteBtn = commentEl.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal({
          title: 'Delete Comment',
          message: 'Are you sure you want to delete this comment? This cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
          const res = await window.apiService.deleteComment(comment._id);
          commentEl.remove();
          if (res.data && res.data.commentCount !== undefined && postCard) {
            const commentCountBadge = postCard.querySelector('.comment-count');
            if (commentCountBadge) commentCountBadge.textContent = res.data.commentCount;
          }
          showToast('Comment deleted', 'info');
        } catch (err) {
          showToast(err.message || 'Failed to delete comment', 'error');
        }
      });
    }

    // 4. Inline Reply to Comment
    if (currentUser && !isReply) {
      const replyBtn = commentEl.querySelector('.reply-btn');
      const inlineReplyBox = commentEl.querySelector('.inline-reply-box');

      replyBtn.addEventListener('click', () => {
        const isVisible = inlineReplyBox.style.display === 'block';
        if (isVisible) {
          inlineReplyBox.style.display = 'none';
          inlineReplyBox.innerHTML = '';
          return;
        }

        inlineReplyBox.style.display = 'block';
        inlineReplyBox.innerHTML = `
          <div class="inline-form-box">
            <textarea class="reply-comment-input" placeholder="Replying to @${escapeHTML(authorName)}..."></textarea>
            <div class="inline-form-actions">
              <button class="btn btn-sm btn-secondary cancel-reply-btn">Cancel</button>
              <button class="btn btn-sm btn-primary send-reply-btn">Post Reply</button>
            </div>
          </div>
        `;

        const textarea = inlineReplyBox.querySelector('.reply-comment-input');
        textarea.focus();

        inlineReplyBox.querySelector('.cancel-reply-btn').addEventListener('click', () => {
          inlineReplyBox.style.display = 'none';
          inlineReplyBox.innerHTML = '';
        });

        inlineReplyBox.querySelector('.send-reply-btn').addEventListener('click', async () => {
          const replyContent = textarea.value.trim();
          if (!replyContent) {
            showToast('Reply content cannot be empty', 'warning');
            return;
          }

          try {
            const res = await window.apiService.createComment(postId, replyContent, comment._id);
            inlineReplyBox.style.display = 'none';
            inlineReplyBox.innerHTML = '';

            const repliesContainer = commentEl.querySelector('.comment-replies-container');
            repliesContainer.style.display = 'flex';

            const newReplyEl = renderSingleCommentElement(res.data.comment, postId, postCard, true);
            repliesContainer.appendChild(newReplyEl);

            comment.replyCount = (comment.replyCount || 0) + 1;
            let viewRepliesBtn = commentEl.querySelector('.view-replies-btn');
            if (!viewRepliesBtn) {
              viewRepliesBtn = document.createElement('button');
              viewRepliesBtn.className = 'view-replies-btn';
              commentEl.querySelector('.comment-content-box').insertBefore(viewRepliesBtn, repliesContainer);
            }
            viewRepliesBtn.innerHTML = `<span>💬 View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}</span>`;

            if (postCard) {
              const commentCountBadge = postCard.querySelector('.comment-count');
              if (commentCountBadge) commentCountBadge.textContent = res.data.commentCount;
            }

            showToast('Reply posted successfully', 'success');
          } catch (err) {
            showToast(err.message || 'Failed to post reply', 'error');
          }
        });
      });
    }

    // 5. View Nested Replies
    if (!isReply && comment.replyCount > 0) {
      const viewRepliesBtn = commentEl.querySelector('.view-replies-btn');
      const repliesContainer = commentEl.querySelector('.comment-replies-container');

      if (viewRepliesBtn) {
        viewRepliesBtn.addEventListener('click', async () => {
          const isVisible = repliesContainer.style.display === 'flex';
          if (isVisible) {
            repliesContainer.style.display = 'none';
            viewRepliesBtn.innerHTML = `<span>💬 View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}</span>`;
            return;
          }

          repliesContainer.style.display = 'flex';
          repliesContainer.innerHTML = '<div class="skeleton-line" style="height:15px; width:50%; margin:0.3rem 0;"></div>';
          viewRepliesBtn.innerHTML = `<span>💬 Hide replies</span>`;

          try {
            const res = await window.apiService.getCommentReplies(comment._id);
            const replies = res.data.replies;
            repliesContainer.innerHTML = '';

            if (replies.length === 0) {
              repliesContainer.innerHTML = '<p style="font-size:0.75rem; color:var(--text-muted);">No replies found.</p>';
              return;
            }

            replies.forEach(reply => {
              const replyEl = renderSingleCommentElement(reply, postId, postCard, true);
              repliesContainer.appendChild(replyEl);
            });
          } catch (err) {
            repliesContainer.innerHTML = '<p style="font-size:0.75rem; color:var(--danger);">Failed to load replies.</p>';
          }
        });
      }
    }

    return commentEl;
  };


  // Helper function to escape HTML
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

  // Search Input Handler with debounce & clear button
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    searchClearBtn.style.display = val ? 'block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      activeSearchQuery = val;
      if (val.length >= 2) {
        searchGlobalResults();
      } else {
        searchResultsPanel.style.display = 'none';
      }
    }, 400);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    activeSearchQuery = '';
    searchClearBtn.style.display = 'none';
    searchResultsPanel.style.display = 'none';
  });

  document.querySelectorAll('.search-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.search-tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      activeSearchType = tab.dataset.searchType;
      searchGlobalResults();
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-search')) searchResultsPanel.style.display = 'none';
  });

  // Sidebar Nav Links Handler
  const setNavActive = (activeId) => {
    [navHome, navMessages, navMyPosts, navFrozenFeed, navProfile].forEach(el => {
      if (el) el.classList.remove('active');
    });
    [mobileNavHome, mobileNavMessages, mobileNavMyPosts, mobileNavFrozen, mobileNavProfile].forEach(el => {
      if (el) el.classList.remove('active');
    });

    if (activeId === 'home') {
      if (navHome) navHome.classList.add('active');
      if (mobileNavHome) mobileNavHome.classList.add('active');
    } else if (activeId === 'messages') {
      if (navMessages) navMessages.classList.add('active');
      if (mobileNavMessages) mobileNavMessages.classList.add('active');
    } else if (activeId === 'myposts') {
      if (navMyPosts) navMyPosts.classList.add('active');
      if (mobileNavMyPosts) mobileNavMyPosts.classList.add('active');
    } else if (activeId === 'frozen') {
      if (navFrozenFeed) navFrozenFeed.classList.add('active');
      if (mobileNavFrozen) mobileNavFrozen.classList.add('active');
    } else if (activeId === 'profile') {
      if (navProfile) navProfile.classList.add('active');
      if (mobileNavProfile) mobileNavProfile.classList.add('active');
    }
  };

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setNavActive('home');
    activeFilter = 'all';
    activeTag = '';
    hashtagPageHeader.style.display = 'none';
    hashtagLoadMore.style.display = 'none';
    fetchPosts(true);
  };

  const handleMyPostsClick = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) return openModal(authModal);
    setNavActive('myposts');
    activeFilter = 'myposts';
    activeTag = '';
    hashtagPageHeader.style.display = 'none';
    hashtagLoadMore.style.display = 'none';
    fetchPosts(true);
  };

  const handleFrozenClick = (e) => {
    if (e) e.preventDefault();
    setNavActive('frozen');
    activeFilter = 'frozen';
    activeTag = '';
    hashtagPageHeader.style.display = 'none';
    hashtagLoadMore.style.display = 'none';
    fetchPosts(true);
  };

  const handleProfileClick = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) return openModal(authModal);
    setNavActive('profile');
    openModal(profileModal);
  };

  if (navHome) navHome.addEventListener('click', handleHomeClick);
  if (navMyPosts) navMyPosts.addEventListener('click', handleMyPostsClick);
  if (navFrozenFeed) navFrozenFeed.addEventListener('click', handleFrozenClick);
  if (navProfile) navProfile.addEventListener('click', handleProfileClick);

  // Mobile Bottom Navigation Handlers
  if (mobileNavHome) mobileNavHome.addEventListener('click', handleHomeClick);
  if (mobileNavMyPosts) mobileNavMyPosts.addEventListener('click', handleMyPostsClick);
  if (mobileNavFrozen) mobileNavFrozen.addEventListener('click', handleFrozenClick);
  if (mobileNavProfile) mobileNavProfile.addEventListener('click', handleProfileClick);

  // Load More Pagination Button
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

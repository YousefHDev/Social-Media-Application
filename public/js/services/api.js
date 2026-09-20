/**
 * Centralized API Service for VibeSpace Social Media App
 * Handles fetch requests, JWT Bearer authentication header,
 * transparent Refresh Token rotation on 401 Unauthorized, and unified error responses.
 */

class ApiService {
  constructor() {
    this.baseUrl = window.CONFIG ? window.CONFIG.API_BASE_URL : '/api';
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // Retrieve stored JWT tokens
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Add subscriber for pending requests during token refresh
  onRefreshed(token) {
    this.refreshSubscribers.map((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  addRefreshSubscriber(callback) {
    this.refreshSubscribers.push(callback);
  }

  // Refresh token method
  async refreshAuthToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        this.clearTokens();
        throw new Error(data.message || 'Session expired. Please log in again.');
      }

      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    } catch (err) {
      this.clearTokens();
      throw err;
    }
  }

  // Core fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = options.headers || {};

    // Attach JWT Access Token if available and not a formData header override
    const token = this.getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Default to JSON Content-Type unless uploading FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      let response = await fetch(url, config);

      // Intercept 401 Unauthorized for automatic token refresh (except auth endpoints)
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup') && !endpoint.includes('/auth/refresh')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.refreshAuthToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);
          } catch (refreshErr) {
            this.isRefreshing = false;
            if (window.appEvents && typeof window.appEvents.onSessionExpired === 'function') {
              window.appEvents.onSessionExpired();
            }
            throw refreshErr;
          }
        }

        const retryOriginalRequest = new Promise((resolve) => {
          this.addRefreshSubscriber((newToken) => {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(fetch(url, config));
          });
        });

        response = await retryOriginalRequest;
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'An error occurred during request execution');
        error.status = response.status;
        error.errors = data.errors || null;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Convenience HTTP Methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }

  // Follow System API Endpoints
  followUser(userId) {
    return this.post(`/users/${userId}/follow`);
  }

  unfollowUser(userId) {
    return this.delete(`/users/${userId}/follow`);
  }

  getFollowers(userId) {
    return this.get(`/users/${userId}/followers`);
  }

  getFollowing(userId) {
    return this.get(`/users/${userId}/following`);
  }

  getSuggestedUsers() {
    return this.get('/users/suggested/people');
  }

  getFollowStatus(userId) {
    return this.get(`/users/${userId}/follow-status`);
  }

  // Real-Time Chat API Endpoints
  getConversations() {
    return this.get('/chat/conversations');
  }

  createOrGetConversation(recipientId) {
    return this.post('/chat/conversations', { recipientId });
  }

  getMessages(conversationId) {
    return this.get(`/chat/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId, content) {
    return this.post(`/chat/conversations/${conversationId}/messages`, { content });
  }

  // Advanced Comment System API Endpoints
  getPostComments(postId, page = 1, limit = 10) {
    return this.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  }

  getCommentReplies(commentId) {
    return this.get(`/comments/${commentId}/replies`);
  }

  createComment(postId, content, parentCommentId = null) {
    return this.post(`/posts/${postId}/comments`, { content, parentCommentId });
  }

  updateComment(commentId, content) {
    return this.patch(`/comments/${commentId}`, { content });
  }

  deleteComment(commentId) {
    return this.delete(`/comments/${commentId}`);
  }

  toggleLikeComment(commentId) {
    return this.post(`/comments/${commentId}/like`);
  }

  getNotifications() {
    return this.get('/notifications');
  }

  markNotificationRead(notificationId) {
    return this.patch(`/notifications/${notificationId}/read`);
  }

  markAllNotificationsRead() {
    return this.patch('/notifications/read-all');
  }

  getStories() {
    return this.get('/stories');
  }

  createStory(formData) {
    return this.upload('/stories', formData);
  }

  viewStory(storyId) {
    return this.patch(`/stories/${storyId}/view`);
  }

  reactToStory(storyId, reaction) {
    return this.put(`/stories/${storyId}/reaction`, { reaction });
  }

  getStoryViewers(storyId) {
    return this.get(`/stories/${storyId}/viewers`);
  }

  deleteStory(storyId) {
    return this.delete(`/stories/${storyId}`);
  }

  search(query, type = 'all', page = 1, limit = 10) {
    return this.get(`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`);
  }

  getTrendingHashtags(limit = 8) {
    return this.get(`/hashtags/trending?limit=${limit}`);
  }

  getHashtagPosts(tag, page = 1, sort = 'recent', limit = 10) {
    return this.get(`/hashtags/${encodeURIComponent(tag)}?page=${page}&sort=${sort}&limit=${limit}`);
  }

  reactToPost(postId, reaction) {
    return this.put(`/posts/${postId}/reaction`, { reaction });
  }
}

window.apiService = new ApiService();

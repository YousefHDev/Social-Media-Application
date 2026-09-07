// Global API configuration
const CONFIG = {
  // Uses custom window.ENV_API_URL if defined, otherwise defaults to relative origin + '/api'
  API_BASE_URL: (window.ENV_API_URL && window.ENV_API_URL.trim()) ? window.ENV_API_URL.replace(/\/$/, '') : (window.location.origin + '/api'),
  DEFAULT_AVATAR: 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&name='
};

window.CONFIG = CONFIG;

import axios from 'axios';

const API_URL =
typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL ?
import.meta.env.VITE_API_URL :
'http://localhost:3333';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('heychef_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap backend's { data: ... } wrapper and handle 401
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap backend's { data: ... } wrapper
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isLoginAttempt = url.includes('/auth/login') || url.includes('/admin/auth/login');
      const isRefreshAttempt = url.includes('/auth/refresh');

      if (!isLoginAttempt && !isRefreshAttempt) {
        // Try to refresh the access token
        const refreshToken = localStorage.getItem('heychef_refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
            if (newToken) {
              localStorage.setItem('heychef_token', newToken);
              // Retry original request with new token
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(error.config);
            }
          } catch {
            // Refresh failed, fall through to logout
          }
        }

        localStorage.removeItem('heychef_token');
        localStorage.removeItem('heychef_user');
        localStorage.removeItem('heychef_user_type');
        localStorage.removeItem('heychef_refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('heychef_token');
      localStorage.removeItem('heychef_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
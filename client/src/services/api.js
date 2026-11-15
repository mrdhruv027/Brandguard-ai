import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject token and active role
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('brandguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const activeRole = localStorage.getItem('brandguard_role');
  if (activeRole) {
    config.headers['x-demo-role'] = activeRole;
  }

  return config;
});

export default api;

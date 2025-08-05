// src/api/authApi.js
import axios from 'axios';
import { BASE_URL } from './constants';

// Create a single API instance for auth
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  maxRedirects: 1,
  validateStatus: (status) => (status >= 200 && status < 303) || status === 302,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to add token to headers if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API methods
export const login = (email, password) =>
  axiosInstance.post('/auth/login', null, { params: { email, password } });

export const logout = () =>
  axiosInstance.post('/auth/logout');

export const register = (userData) =>
  axiosInstance.post('/auth/register', userData);

export const getCurrentUser = () =>
  axiosInstance.get('/auth/me');

// Export the axios instance if you need custom calls elsewhere
export default axiosInstance;

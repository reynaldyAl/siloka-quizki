// services/authService.js - Authentication API services
// services/authService.js
import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/login', { username, password });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },


  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService;
// services/authService.js
import api from './api';

const authService = {
  register: async (userData) => {
    try {
      console.log("Registering user:", userData);
      const response = await api.post('/register', userData);
      console.log("Registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      console.log("Attempting login for:", username);
      const response = await api.post('/login', { username, password });
      console.log("Login response:", response.data);
      
      // Store token in localStorage
      if (response.data.access_token || response.data.token) {
        const token = response.data.access_token || response.data.token;
        localStorage.setItem('token', token);
      } else {
        console.warn("No token found in login response:", response.data);
      }
      
      return {
        user: response.data.user || { username, name: username }
      };
    } catch (error) {
      console.error("Login API error:", error);
      // Use a more helpful error message for common issues
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 404) {
        throw new Error('Login service not found. Server may be down.');
      } else if (!error.response) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      throw error;
    }
  },

  logout: () => {
    try {
      // If you have a logout endpoint
      // api.post('/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error("Logout error:", error);
      // Always remove token regardless of API error
      localStorage.removeItem('token');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService;
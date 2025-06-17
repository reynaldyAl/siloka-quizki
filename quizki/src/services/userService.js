// services/userService.js
import api from './api';

const userService = {
  getCurrentUser: async () => {
    try {
      // Change from /users/me to /me which appears to be the correct endpoint
      const response = await api.get('/me');
      console.log("Current user data retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      
      // Get user data from localStorage as fallback
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          console.log("Using stored user data from localStorage");
          return JSON.parse(storedUser);
        }
      } catch (parseError) {
        console.error("Error parsing stored user:", parseError);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock user data for development");
        const mockUser = {
          id: 1,
          username: "testuser",
          name: "Test User",
          email: "test@example.com"
        };
        return mockUser;
      }
      
      // Return minimal user object if everything fails
      console.log("Using minimal fallback user object");
      return {
        id: localStorage.getItem('userId') || 1,
        username: localStorage.getItem('username') || 'User',
      };
    }
  },
  
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/me', userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await api.get('/my-stats');
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      
      // Return basic stats in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock user stats for development");
        return {
          quizzesTaken: 3,
          questionsAnswered: 15,
          correctAnswers: 12,
          averageScore: 80
        };
      }
      
      return {
        quizzesTaken: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        averageScore: 0
      };
    }
  }
};

export default userService;
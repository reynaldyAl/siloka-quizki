// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext();

// Export the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Check for token and user data
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log("Auth initialization - Token exists:", !!token);
        
        if (token) {
          try {
            // Parse stored user if available
            const userData = storedUser ? JSON.parse(storedUser) : null;
            setUser(userData);
            setIsAuthenticated(true);
            console.log("Auth initialized with user data:", userData?.username);
          } catch (err) {
            console.error('Failed to parse user data:', err);
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } else {
          // Clear auth data if no token
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          console.log("No token found, user is not authenticated");
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Listen for storage events (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log("Storage change detected for:", e.key);
        initAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    initAuth();
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function that works with your API
  const login = async (username, password) => {
    console.log("AuthContext login called with username:", username);
    setLoading(true);
    setError(null);
    
    try {
      // Make API call to login endpoint
      const response = await api.post('/login', {
        username,
        password
      });
      
      console.log("Login API response:", response.data);
      
      // Save auth token to localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Get user profile data
        try {
          const profileResponse = await api.get('/me');
          console.log('User profile data:', profileResponse.data);
          
          // Save user data to localStorage and state
          const userData = profileResponse.data;
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update context state
          setUser(userData);
          setIsAuthenticated(true);
          
          console.log("Login successful, user state updated:", userData.username);
          return userData;
        } catch (profileErr) {
          console.error('Could not fetch profile data:', profileErr);
          throw new Error('Failed to fetch user profile');
        }
      } else {
        throw new Error('No access token received from server');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logout function called");
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update context state
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch custom event for components to listen to
    try {
      window.dispatchEvent(new CustomEvent('auth-logout'));
      console.log("Logged out, auth data cleared, custom event dispatched");
    } catch (e) {
      // Fallback for older browsers
      const event = document.createEvent('Event');
      event.initEvent('auth-logout', true, true);
      window.dispatchEvent(event);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
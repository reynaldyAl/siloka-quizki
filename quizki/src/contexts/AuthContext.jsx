import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

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

  // Initialize auth state and set up event listener for storage changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for both token and user data
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log("Auth initialization - Token exists:", !!token);
        
        if (token) {
          try {
            // Try to get current user info with the token
            const userData = storedUser ? JSON.parse(storedUser) : null;
            setUser(userData || { username: 'User' }); // Set basic user if no stored data
            setIsAuthenticated(true);
            console.log("Auth initialized with token and user data");
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

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting login for:", username);
      
      // Development mode check
      const isDevelopmentMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      
      // Use mock login in development if API is not available
      if (isDevelopmentMode && (username === 'admin' || username === 'test')) {
        console.log("Using development fallback login");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock token and user
        const mockToken = "dev-token-" + Math.random().toString(36).substring(2);
        const userData = { 
          username, 
          name: username === 'admin' ? 'Administrator' : 'Test User',
          role: username === 'admin' ? 'admin' : 'user'
        };
        
        // Store both token and user data
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Development login successful", { token: mockToken, user: userData });
        return userData;
      }
      
      // Try the real API login
      const response = await authService.login(username, password);
      console.log("Login API response:", response);
      
      // Make sure we have a user object
      const userData = response.user || { username, name: username };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log("Login successful, token and user data saved");
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout(); // This will remove the token
    } catch (err) {
      console.error("Logout API error:", err);
    }
    
    // Always clear local storage even if API fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new Event('auth-logout'));
    console.log("Logged out, auth data cleared");
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
// services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000, // 10 seconds
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || config.params);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log("Added auth token to request");
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Enhanced error logging with special handling for dev mode
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error ${error.response.status}:`, error.response.data);
      
      // Handle 401 Unauthorized responses
      if (error.response.status === 401) {
        console.warn("Authentication error - current token:", localStorage.getItem('token') ? "[TOKEN EXISTS]" : "[NO TOKEN]");
        
        // Only clear auth data for genuine auth errors, not login attempts
        const isLoginAttempt = error.config.url.includes('/login');
        
        if (!isLoginAttempt) {
          // Still clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Dispatch an event that components can listen for
          const authErrorEvent = new CustomEvent('auth:error', { 
            detail: { 
              status: error.response.status, 
              message: "Authentication failed"
            } 
          });
          window.dispatchEvent(authErrorEvent);
          
          // Store auth error in sessionStorage for components to check
          sessionStorage.setItem('auth_error', JSON.stringify({
            timestamp: Date.now(),
            message: "Your session has expired. Please log in again."
          }));
          
          console.warn("Auth token invalid - components should handle redirect");
          
          // REMOVED automatic redirect to let components handle it
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response Error:", error.request);
      
      // Don't interrupt login page with alerts
      if (!window.location.pathname.includes('/login')) {
        // For development, provide helpful message but don't show alert in production
        if (process.env.NODE_ENV === 'development') {
          console.warn("Server connection failed. Using development mode may help.");
        }
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Setup Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add a method for checking API availability
api.checkAvailability = async () => {
  try {
    await axios.get(`${API_URL}/health-check`, { timeout: 3000 });
    return true;
  } catch (error) {
    console.log("API availability check failed:", error.message);
    return false;
  }
};

export default api;
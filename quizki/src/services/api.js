// services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Create axios instance with improved CORS configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for better CORS handling with authentication
  withCredentials: true,
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
    
    // Add special headers for CORS preflight requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      // Add more headers to help with CORS
      config.headers['Access-Control-Allow-Origin'] = '*';
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
          console.warn("Make sure your FastAPI server is running with: uvicorn main:app --reload --host 0.0.0.0");
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
    const response = await axios.get(`${API_URL}/health-check`, { 
      timeout: 3000,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    console.log("Health check response:", response.data);
    return {
      available: true,
      data: response.data
    };
  } catch (error) {
    console.log("API availability check failed:", error.message);
    return {
      available: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

// Comprehensive connection diagnostic function
api.diagnoseConnection = async () => {
  try {
    console.log("Diagnosing API connection...");
    
    // First try a direct fetch to avoid axios configuration issues
    const fetchResponse = await fetch(`${API_URL}/health-check`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    
    if (!fetchResponse.ok) {
      throw new Error(`Fetch failed with status: ${fetchResponse.status}`);
    }
    
    const fetchData = await fetchResponse.json();
    console.log("Fetch API connection test:", fetchData);
    
    // Also try with axios to verify both methods work
    const axiosResponse = await api.checkAvailability();
    console.log("Axios connection test:", axiosResponse);
    
    return {
      status: 'connected',
      fetchTest: fetchData,
      axiosTest: axiosResponse,
      suggestions: []
    };
  } catch (error) {
    console.error("Connection diagnosis failed:", error);
    return {
      status: 'disconnected',
      error: error.message,
      suggestions: [
        "Make sure the FastAPI server is running on port 8000",
        "Check if CORS is properly configured in the backend",
        "Try running the server with: uvicorn main:app --reload --host 0.0.0.0 --port 8000",
        "Check if there's a firewall blocking connections",
        "Verify the API_URL is correct: " + API_URL
      ]
    };
  }
};

// Enhance the API with additional methods for resilient operations
api.safePost = async (url, data = {}, config = {}) => {
  try {
    // Log the attempt
    console.log(`Attempting safe POST to ${url}`, data);
    
    // Special handling for quiz and question creation
    if (url.includes('/questions') || url.includes('/quizzes')) {
      console.log('Creating resource, ensuring proper configuration...');
      
      // Make sure authorization header is present
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to create this resource');
      }
      
      // Create a new config object to avoid modifying the original
      const enhancedConfig = { ...config };
      if (!enhancedConfig.headers) {
        enhancedConfig.headers = {};
      }
      
      enhancedConfig.headers['Authorization'] = `Bearer ${token}`;
      enhancedConfig.headers['X-Requested-With'] = 'XMLHttpRequest';
      enhancedConfig.headers['Access-Control-Allow-Origin'] = '*';
      
      try {
        // First attempt: Use the enhanced axios instance
        return await api.post(url, data, enhancedConfig);
      } catch (firstError) {
        console.warn("First attempt failed, trying direct axios:", firstError.message);
        
        // Second attempt: bypass the axios instance and use direct axios
        try {
          return await axios({
            method: 'post',
            url: `${API_URL}${url}`,
            data: data,
            headers: enhancedConfig.headers,
            withCredentials: true,
            timeout: 10000
          });
        } catch (secondError) {
          console.warn("Second attempt failed, trying fetch API:", secondError.message);
          
          // Third attempt: Use native fetch as last resort
          const fetchResponse = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data),
            credentials: 'include'
          });
          
          if (!fetchResponse.ok) {
            throw new Error(`Fetch failed with status: ${fetchResponse.status}`);
          }
          
          const responseData = await fetchResponse.json();
          return { data: responseData };
        }
      }
    }
    
    // Regular POST for other endpoints
    return await api.post(url, data, config);
  } catch (error) {
    console.error(`Failed to POST to ${url}:`, error);
    throw error;
  }
};

// Direct fetch method as alternative to axios for problematic endpoints
api.fetchPost = async (url, data = {}) => {
  try {
    console.log(`Using fetch to POST to ${url}`, data);
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Request failed with status ${response.status}: ${errorData ? JSON.stringify(errorData) : 'No error details'}`
      );
    }
    
    const responseData = await response.json();
    return { data: responseData };
  } catch (error) {
    console.error(`Fetch POST to ${url} failed:`, error);
    throw error;
  }
};

// Add retry capability for critical GET operations
api.getWithRetry = async (url, config = {}, retries = 2) => {
  try {
    return await api.get(url, config);
  } catch (error) {
    if (retries === 0 || error.response?.status === 401 || error.response?.status === 403) {
      throw error;
    }
    console.log(`Retrying GET ${url}, ${retries} attempts left...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return api.getWithRetry(url, config, retries - 1);
  }
};

// Test endpoint without authentication
api.testEndpoint = async (url, method = 'GET') => {
  try {
    console.log(`Testing endpoint: ${method} ${url}`);
    
    if (method.toUpperCase() === 'GET') {
      const response = await axios({
        method: 'get',
        url: `${API_URL}${url}`,
        timeout: 5000,
        withCredentials: false, // Try without credentials first
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } else {
      throw new Error('Only GET method is supported for testEndpoint');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export default api;
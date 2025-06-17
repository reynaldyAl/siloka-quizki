// components/auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onSuccess, theme = 'dark', showRegister = true, showForgotPassword = true }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  // Configure theme-based styling
  const inputBgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const inputBorderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputTextColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
  const placeholderColor = theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const accentHoverColor = theme === 'dark' ? 'hover:text-blue-300' : 'hover:text-blue-800';

  // Check API availability on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Simple API availability check - use appropriate endpoint
        const response = await fetch('http://127.0.0.1:8000/health-check', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          timeout: 3000
        });
        
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
          console.warn("API returned non-OK response:", response.status);
        }
      } catch (err) {
        setServerStatus('offline');
        console.warn("API availability check failed:", err.message);
      }
    };
    
    checkServerStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log("Submitting login form...");
      await login(username, password);
      
      if (onSuccess) {
        onSuccess(); // Call the success callback if provided
      } else {
        // Default navigation if no success callback
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login form error:", err);
      
      // Handle specific errors
      if (err.message) {
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (serverStatus === 'offline') {
        // If server is offline, show more helpful message
        setError('Cannot connect to server. Using "admin" as username works in development mode.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded" role="alert">
          <p>{error}</p>
          {serverStatus === 'offline' && (
            <p className="text-sm mt-1 font-medium">
              Server appears to be offline. In development mode, you can use username "admin" with any password.
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="username" className={`block ${secondaryTextColor} font-medium mb-2`}>
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg ${inputBgColor} border ${inputBorderColor} ${inputTextColor} ${placeholderColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Your username"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={`block ${secondaryTextColor} font-medium mb-2`}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg ${inputBgColor} border ${inputBorderColor} ${inputTextColor} ${placeholderColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder="Your password"
          required
        />
        
        {showForgotPassword && (
          <div className="flex justify-end mt-2">
            <Link to="/forgot-password" className={`text-sm ${accentColor} ${accentHoverColor}`}>
              Forgot your password?
            </Link>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0"></circle>
            </svg>
            Logging in...
          </div>
        ) : (
          'Log In'
        )}
      </button>

      {showRegister && (
        <div className={`text-center mt-4 ${secondaryTextColor}`}>
          Don't have an account?{' '}
          <Link to="/register" className={`${accentColor} ${accentHoverColor} font-medium`}>
            Register
          </Link>
        </div>
      )}
      
      {serverStatus === 'offline' && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 text-sm">
          <p className="font-medium">Development Mode Notice</p>
          <p>API server appears to be offline. You can use these test credentials:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Username: <code className="bg-gray-100 px-1 py-0.5 rounded">admin</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">test</code></li>
            <li>Password: <code className="bg-gray-100 px-1 py-0.5 rounded">any value</code></li>
          </ul>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
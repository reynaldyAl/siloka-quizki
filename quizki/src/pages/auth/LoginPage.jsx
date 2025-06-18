// pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import Navbar from '../../components/common/Navbar/Navbar';
import api from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Pre-fill username if provided from registration
      if (location.state.username) {
        setUsername(location.state.username);
      }
      
      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      console.log('Authenticating user:', username);
      
      // Make API call to login endpoint
      const response = await api.post('/login', {
        username: username,
        password: password
      });
      
      console.log('Login successful:', response.data);
      
      // Save auth token to localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Get user profile data
        try {
          const profileResponse = await api.get('/me');
          console.log('User profile data:', profileResponse.data);
          
          // Save user data to localStorage
          localStorage.setItem('user', JSON.stringify(profileResponse.data));
        } catch (profileErr) {
          console.warn('Could not fetch profile data:', profileErr);
          
          // Save minimal user data if profile fetch fails
          localStorage.setItem('user', JSON.stringify({ username }));
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('No access token received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response) {
        // The server responded with an error status
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 422) {
          setError('Invalid login format. Please check your credentials.');
        } else {
          setError(err.response.data.detail || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        // No response received
        setError('Could not connect to the server. Please try again later.');
      } else {
        // Error in request setup
        setError('Login request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-fullscreen-container">
      <Navbar />
      {/* Background elements */}
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>
      
      {/* Floating planets */}
      <div className="planet planet2"></div>
      <div className="planet planet3"></div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="orbit-logo">
              <div className="orbit">
                <div className="satellite"></div>
              </div>
              <div className="central-dot"></div>
            </div>
            
            <h1 className="login-title">
              Welcome to <span className="gradient-text">QuizKi</span>
            </h1>
            
            <p className="login-subtitle">
              Sign in to continue your cosmic learning adventure
            </p>
          </div>
          
          {successMessage && (
            <div className="success-alert">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p>{successMessage}</p>
            </div>
          )}
          
          {error && (
            <div className="error-alert">
              <div className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Your username"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Your password"
                  required
                />
              </div>
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot your password?</Link>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              theme="space"
              size="large"
              fullWidth={true}
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <div className="button-loader">
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Launching...</span>
                </div>
              ) : (
                'Launch into QuizKi'
              )}
            </Button>
          </form>
          
          <div className="login-separator">
            <span>Or continue with</span>
          </div>
          
          <div className="social-login">
            <button type="button" className="social-button twitter">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>
            
            <button type="button" className="social-button github">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="register-prompt">
            <p>
              Don't have an account yet?{' '}
              <Link to="/register">Register for Free!</Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add CSS for success message */}
      <style>
        {`
        .success-alert {
          display: flex;
          background-color: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          color: #d1fae5;
          align-items: center;
        }
        
        .success-icon {
          color: #10b981;
          flex-shrink: 0;
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.75rem;
        }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
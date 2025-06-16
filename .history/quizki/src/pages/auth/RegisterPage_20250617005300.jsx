// pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import Navbar from '../../components/common/Navbar/Navbar';
import api from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API call - remove confirmPassword as backend doesn't need it
      const apiData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      console.log('Registering user:', apiData);
      
      // Make API call to register endpoint
      const response = await api.post('/register', apiData);
      console.log('Registration response:', response.data);
      
      // Registration successful
      navigate('/login', { 
        state: { 
          message: 'Registration successful! You can now log in.',
          username: formData.username 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error responses
      if (err.response) {
        // The server responded with an error status
        if (err.response.status === 400) {
          // Bad request - check for specific error messages
          if (err.response.data.detail && typeof err.response.data.detail === 'string') {
            setError(err.response.data.detail);
          } else if (err.response.data.detail && Array.isArray(err.response.data.detail)) {
            setError(err.response.data.detail[0].msg || 'Invalid form data');
          } else {
            setError('Please check your input and try again');
          }
        } else if (err.response.status === 409) {
          // Conflict - username or email already exists
          setError('Username or email already in use');
        } else {
          setError('Registration failed: ' + (err.response.data.detail || 'Server error'));
        }
      } else if (err.request) {
        // No response received
        setError('No response from the server. Please try again later.');
      } else {
        // Error in request setup
        setError('Failed to register. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-fullscreen-container">
      <Navbar />
      
      {/* Background elements */}
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>
      
      {/* Floating planets */}
      <div className="planet planet1"></div>
      <div className="planet planet2"></div>
      <div className="planet planet3"></div>
      
      <div className="register-content">
        <div className="register-card">
          <div className="register-header">
            <div className="orbit-logo">
              <div className="orbit">
                <div className="satellite"></div>
              </div>
              <div className="central-dot"></div>
            </div>
            
            <h1 className="register-title">
              Join <span className="gradient-text">QuizKi</span>
            </h1>
            
            <p className="register-subtitle">
              Register to begin your cosmic learning adventure
            </p>
          </div>
          
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
          
          <form onSubmit={handleSubmit} className="register-form">
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
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Create a username"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Your email address"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Create a password (min. 6 characters)"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              theme="space"
              size="large"
              fullWidth={true}
              disabled={loading}
              className="register-button"
            >
              {loading ? (
                <div className="button-loader">
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Join The QuizKi Universe'
              )}
            </Button>
            
            <div className="terms-policy">
              By registering, you agree to our 
              <Link to="/terms" className="terms-link"> Terms of Service</Link> and 
              <Link to="/privacy" className="terms-link"> Privacy Policy</Link>
            </div>
          </form>
          
          <div className="login-prompt">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign In!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
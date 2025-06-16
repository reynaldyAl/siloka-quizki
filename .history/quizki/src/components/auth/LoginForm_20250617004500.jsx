<<<<<<< HEAD
// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = ({ 
  onSuccess, 
  theme = 'light',
  showForgotPassword = true,
  showSocialLogin = false 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  // Determine theme classes
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const inputBgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputTextColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
  const placeholderColor = theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const accentHoverColor = theme === 'dark' ? 'hover:text-blue-300' : 'hover:text-blue-800';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(username, password);
      if (onSuccess) onSuccess(); // Call the success callback if provided
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={`rounded-xl shadow-xl p-8 w-full max-w-md ${bgColor} border ${borderColor}`}>
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold ${textColor} mb-3`}>
          Welcome Back to <span className="text-blue-500">QuizKi!</span>
        </h2>
        <p className={secondaryTextColor}>Sign in to continue your learning adventure.</p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging In...
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className={secondaryTextColor}>
          Don't have an account yet?{' '}
          <Link to="/register" className={`${accentColor} font-semibold ${accentHoverColor}`}>
            Register for Free!
          </Link>
        </p>
      </div>

      {showSocialLogin && (
        <>
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${borderColor}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${bgColor} ${secondaryTextColor}`}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>
            <button
              type="button" 
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;
=======
// components/auth/LoginForm.jsx - Login form component
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

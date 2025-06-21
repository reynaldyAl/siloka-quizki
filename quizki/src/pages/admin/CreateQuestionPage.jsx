// pages/admin/CreateQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import QuestionForm from '../../components/admin/QuestionForm';

const CreateQuestionPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // State untuk mengontrol apakah halaman sedang dalam proses redirect
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (questionData) => {
    // Jangan izinkan submit jika sedang loading atau sudah sukses dan akan redirect
    if (loading || isRedirecting) return;

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      setSuccess(false); // Clear previous success state

      console.log('Submitting question:', questionData);

      // Send request to the API
      const response = await api.post('/questions', questionData);
      console.log('Question created:', response.data);

      setSuccess(true);
      setIsRedirecting(true); // Set redirecting state

      // Automatically redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // 2 seconds delay

    } catch (err) {
      console.error('Error creating question:', err);
      // More specific error handling
      if (err.response) {
        // Server responded with a status other than 2xx
        if (err.response.status === 400) {
          setError(err.response.data.message || 'Invalid input. Please check your data.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication error. Please login again as an administrator.');
          setTimeout(() => navigate('/login'), 3000); // Redirect to login on auth error
        } else {
          setError(err.response.data.message || `Server error: ${err.response.status}. Please try again.`);
        }
      } else if (err.request) {
        // Request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something else happened while setting up the request
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col justify-center items-center"> {/* Centering content */}
      <div className="w-full"> {/* Container untuk tombol back dan form card */}
        <div className="mb-6 text-left"> {/* Aligned to left */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isRedirecting} // Disable during loading or redirect
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-600"> {/* Added hover effects, larger padding */}
          <h1 className="text-3xl font-extrabold text-white mb-6 text-center">Create New Question</h1> {/* Larger title, centered */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg flex items-center space-x-3 animate-fade-in-down">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-900/40 border border-green-700 text-green-200 p-4 rounded-lg flex items-center space-x-3 animate-fade-in-down">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Question created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <QuestionForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
      {/* Tailwind CSS keyframes for animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CreateQuestionPage;
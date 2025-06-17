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
  
  const handleSubmit = async (questionData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Submitting question:', questionData);
      
      // Send request to the API
      const response = await api.post('/questions', questionData);
      console.log('Question created:', response.data);
      
      setSuccess(true);
      
      // Automatically redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.message || 'Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Question</h1>
        
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
            Question created successfully! Redirecting to dashboard...
          </div>
        )}
        
        <QuestionForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default CreateQuestionPage;
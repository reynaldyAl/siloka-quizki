// pages/admin/EditQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import QuestionForm from '../../components/admin/QuestionForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditQuestionPage = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/questions/${id}`);
        setQuestion(response.data);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestion();
  }, [id]);
  
  const handleSubmit = async (questionData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await api.put(`/questions/${id}`, questionData);
      console.log('Question updated:', response.data);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err.response?.data?.message || 'Failed to update question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner message="Loading question..." />
      </div>
    );
  }
  
  if (error && !question) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
          {error}
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
        <h1 className="text-2xl font-bold text-white mb-6">Edit Question</h1>
        
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
            Question updated successfully! Redirecting to dashboard...
          </div>
        )}
        
        <QuestionForm 
          onSubmit={handleSubmit} 
          loading={submitting} 
          initialData={question} 
        />
      </div>
    </div>
  );
};

export default EditQuestionPage;
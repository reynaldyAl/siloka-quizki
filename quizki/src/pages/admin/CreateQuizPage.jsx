// pages/admin/CreateQuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    timeLimit: 15 // in minutes
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch available questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/questions');
        setQuestions(response.data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: name === 'timeLimit' ? parseInt(value) : value
    });
  };
  
  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question for the quiz.');
      return;
    }
    
    if (!quizData.title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const quizPayload = {
        ...quizData,
        questions: selectedQuestions
      };
      
      console.log('Creating quiz:', quizPayload);
      
      // Send request to API
      const response = await api.post('/quizzes', quizPayload);
      console.log('Quiz created:', response.data);
      
      setSuccess(true);
      
      // Redirect to quiz list after a delay
      setTimeout(() => {
        navigate('/admin/quizzes');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <h1 className="text-2xl font-bold text-white mb-6">Create New Quiz</h1>
        
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
            Quiz created successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details Section */}
          <div className="bg-gray-700 p-5 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Quiz Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-white font-medium mb-2">
                  Quiz Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={quizData.title}
                  onChange={handleInputChange}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter quiz title"
                  disabled={loading}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-white font-medium mb-2">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={quizData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white"
                  placeholder="e.g., Science, History, etc."
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-white font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={quizData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter quiz description"
                  disabled={loading}
                ></textarea>
              </div>
              
              {/* Difficulty */}
              <div>
                <label htmlFor="difficulty" className="block text-white font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={quizData.difficulty}
                  onChange={handleInputChange}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white"
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              {/* Time Limit */}
              <div>
                <label htmlFor="timeLimit" className="block text-white font-medium mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min="1"
                  max="120"
                  value={quizData.timeLimit}
                  onChange={handleInputChange}
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          {/* Question Selection Section */}
          <div className="bg-gray-700 p-5 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Select Questions</h2>
              <div className="text-white">
                {selectedQuestions.length} questions selected
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No questions available. Please create questions first.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {questions.map(question => (
                  <div 
                    key={question.id}
                    className={`border p-4 rounded-lg cursor-pointer ${
                      selectedQuestions.includes(question.id) 
                        ? 'bg-blue-900/30 border-blue-500' 
                        : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="flex items-start">
                      <input 
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => {}}
                        className="mt-1 h-5 w-5 text-blue-500 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-white font-medium">{question.question_text}</div>
                        <div className="text-gray-400 text-sm mt-1">
                          Category: {question.category || 'Uncategorized'} • 
                          Difficulty: {question.difficulty || 'Medium'} •
                          {question.choices?.length || 0} options
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || selectedQuestions.length === 0}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizPage;
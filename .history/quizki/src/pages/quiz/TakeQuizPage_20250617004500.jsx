<<<<<<< HEAD
// pages/quiz/TakeQuizPage.jsx - Quiz taking interface
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../hooks/useQuiz';

const TakeQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // In a real app, you would use the useQuiz custom hook
  // For now, let's use local state with mock data
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch quiz data (mock implementation)
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock quiz data
        const mockQuiz = {
          id: parseInt(id),
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics',
          timeLimit: 15, // minutes
          questions: [
            {
              id: 1,
              text: 'What is JavaScript primarily used for?',
              options: [
                { id: 1, text: 'Styling web pages' },
                { id: 2, text: 'Creating interactive web pages' },
                { id: 3, text: 'Database management' },
                { id: 4, text: 'Server configuration' }
              ],
              correctOptionId: 2
            },
            {
              id: 2,
              text: 'Which of these is NOT a JavaScript data type?',
              options: [
                { id: 1, text: 'Boolean' },
                { id: 2, text: 'String' },
                { id: 3, text: 'Float' },
                { id: 4, text: 'Object' }
              ],
              correctOptionId: 3
            },
            {
              id: 3,
              text: 'Which statement correctly creates a new array in JavaScript?',
              options: [
                { id: 1, text: 'var arr = new Array[]' },
                { id: 2, text: 'var arr = []' },
                { id: 3, text: 'var arr = Array.create()' },
                { id: 4, text: 'var arr = Array()[]' }
              ],
              correctOptionId: 2
            }
          ]
        };
        
        setQuiz(mockQuiz);
        setTimeLeft(mockQuiz.timeLimit * 60); // Convert minutes to seconds
        
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    // Setup timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [id]);
  
  const handleOptionSelect = (questionId, optionId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would submit answers to an API
      // For now, navigate to results with state
      navigate(`/quizzes/${id}/results`, {
        state: {
          userAnswers,
          quiz
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading quiz...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => navigate('/quizzes')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }
  
  if (!quiz) {
    return <div>Quiz not found</div>;
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = (currentQuestionIndex + 1) / quiz.questions.length * 100;
  const answeredQuestionsCount = Object.keys(userAnswers).length;
  
  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Quiz header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <div className="flex justify-between items-center">
          <div className="text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          <div className="bg-gray-100 p-2 rounded flex items-center">
            <span className="mr-2">Time Remaining:</span>
            <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map(option => (
            <div 
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedOption === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded ${
            currentQuestionIndex === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        {isLastQuestion ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        )}
      </div>
      
      {/* Quiz summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded border">
        <div className="font-semibold mb-2">Quiz Summary</div>
        <div className="text-sm text-gray-700">
          {answeredQuestionsCount} of {quiz.questions.length} questions answered
        </div>
        
        {/* Question navigation */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quiz.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 flex items-center justify-center rounded ${
                userAnswers[q.id] 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${currentQuestionIndex === idx ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        
        {answeredQuestionsCount === quiz.questions.length && (
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Submit All Answers'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;
=======
// pages/quiz/TakeQuizPage.jsx - Quiz taking interface
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

<<<<<<< HEAD
// pages/quiz/QuizListPage.jsx - List of available quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch quizzes from the API
    const fetchQuizzes = async () => {
      try {
        // In a real app, replace with actual API call
        // const response = await fetch('http://localhost:8000/api/quizzes');
        // const data = await response.json();
        
        // Mock data for development
        const mockData = [
          {
            id: 1,
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of JavaScript basics',
            questionCount: 10,
            timeLimit: 15, // minutes
            difficulty: 'Beginner'
          },
          {
            id: 2,
            title: 'React Concepts',
            description: 'Challenge yourself with React questions',
            questionCount: 15,
            timeLimit: 20,
            difficulty: 'Intermediate'
          },
          {
            id: 3,
            title: 'Web Development Advanced',
            description: 'Advanced web development concepts and practices',
            questionCount: 20,
            timeLimit: 30,
            difficulty: 'Advanced'
          }
        ];
        
        setTimeout(() => {
          setQuizzes(mockData);
          setLoading(false);
        }, 500); // Simulate network delay
        
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="quiz-list-page">
      <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length > 0 ? (
          quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{quiz.questionCount} questions</span>
                  <span>{quiz.timeLimit} minutes</span>
                  <span>{quiz.difficulty}</span>
                </div>
                
                <Link 
                  to={`/quizzes/${quiz.id}`}
                  className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                >
                  View Quiz
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center py-10">No quizzes available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
=======
// pages/quiz/QuizListPage.jsx - List of available quizzes
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

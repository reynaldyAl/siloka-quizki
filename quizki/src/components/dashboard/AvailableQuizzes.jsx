// components/dashboard/AvailableQuizzes.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const AvailableQuizzes = ({ questions = [], quizzes = [], loading = false }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-700 rounded-lg p-4">
            <div className="h-5 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-1/3 opacity-50"></div>
          </div>
        ))}
      </div>
    );
  }

  // Handle empty state
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-gray-400 font-medium mb-1">No questions available</h3>
        <p className="text-gray-500 text-sm">Check back later for new content</p>
      </div>
    );
  }
  
  // Process quizzes first if available
  if (quizzes && quizzes.length > 0) {
    const displayQuizzes = showAll ? quizzes : quizzes.slice(0, 3);
    
    return (
      <div>
        <div className="space-y-3 mb-3">
          {displayQuizzes.map(quiz => (
            <Link 
              key={quiz.id} 
              to={`/quizzes/${quiz.id}`}
              className="block bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg p-4 transition-all duration-300 transform hover:-translate-y-1 border border-gray-600 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{quiz.title}</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    {quiz.category && (
                      <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded">
                        {quiz.category}
                      </span>
                    )}
                    {quiz.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        quiz.difficulty === 'easy' ? 'bg-green-900/30 text-green-300' : 
                        quiz.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-300' : 
                        'bg-red-900/30 text-red-300'
                      }`}>
                        {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">
                      {quiz.questions?.length || 0} questions
                    </span>
                    {quiz.time_limit && (
                      <span className="text-gray-400 text-xs flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {quiz.time_limit} min
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <span className="bg-blue-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {quiz.questions?.length || 0}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {quizzes.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)} 
            className="text-blue-400 hover:text-blue-300 text-sm font-medium mx-auto block focus:outline-none focus:underline"
          >
            {showAll ? 'Show less' : `Show all ${quizzes.length} quizzes`}
          </button>
        )}
      </div>
    );
  }
  
  // If no quizzes available, display individual questions
  const displayQuestions = showAll ? questions : questions.slice(0, 5);
  
  return (
    <div>
      <div className="space-y-3 mb-3">
        {displayQuestions.map(question => (
          <Link 
            key={question.id} 
            to={`/questions/${question.id}`}
            className="block bg-gray-700 hover:bg-gray-650 rounded-lg p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md border border-gray-700"
            aria-label={`Question: ${question.question_text || question.text}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 pr-4">
                <h3 className="text-white font-medium">
                  {question.question_text || question.text}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-gray-400 text-xs">
                    {question.choices?.length || 0} options
                  </span>
                  
                  {question.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      question.difficulty === 'easy' ? 'bg-green-900/30 text-green-300' : 
                      question.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-300' : 
                      'bg-red-900/30 text-red-300'
                    }`}>
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                  )}
                  
                  {question.category && (
                    <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded">
                      {question.category}
                    </span>
                  )}
                  
                  {question.score && (
                    <span className="text-gray-400 text-xs flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {question.score} pts
                    </span>
                  )}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {questions.length > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="text-blue-400 hover:text-blue-300 text-sm font-medium mx-auto block focus:outline-none focus:underline"
        >
          {showAll ? 'Show less' : `Show all ${questions.length} questions`}
        </button>
      )}
    </div>
  );
};

AvailableQuizzes.propTypes = {
  questions: PropTypes.array,
  quizzes: PropTypes.array,
  loading: PropTypes.bool
};

export default AvailableQuizzes;
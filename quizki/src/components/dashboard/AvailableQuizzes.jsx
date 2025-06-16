// components/dashboard/AvailableQuizzes.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const AvailableQuizzes = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return null;
  }
  
  // Take only the first 5 questions
  const displayQuestions = questions.slice(0, 5);
  
  return (
    <div className="space-y-3">
      {displayQuestions.map(question => (
        <Link 
          key={question.id} 
          to={`/questions/${question.id}`}
          className="block bg-gray-700 hover:bg-gray-650 rounded-lg p-4 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">{question.text}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {question.choices.length} options • {question.difficulty || 'Normal'} difficulty
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
};

AvailableQuizzes.propTypes = {
  questions: PropTypes.array.isRequired
};

export default AvailableQuizzes;
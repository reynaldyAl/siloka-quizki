// components/dashboard/QuestionManagement.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const QuestionManagement = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No questions found.</p>
        <Link to="/admin/create-question" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          Create Your First Question
        </Link>
      </div>
    );
  }
  
  // Display recent 5 questions
  const recentQuestions = [...questions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
    
  return (
    <div>
      <div className="space-y-2">
        {recentQuestions.map(question => (
          <div 
            key={question.id} 
            className="bg-gray-700 p-3 rounded-lg flex justify-between items-center hover:bg-gray-650 transition-colors"
          >
            <div className="truncate mr-4">
              <p className="text-white font-medium truncate" style={{maxWidth: '300px'}}>
                {question.text}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {question.choices.length} options • ID: {question.id}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link 
                to={`/admin/questions/${question.id}/edit`}
                className="text-blue-400 hover:text-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </Link>
              <button 
                className="text-red-400 hover:text-red-300"
                onClick={() => alert(`Delete question ${question.id} (This would trigger a confirmation modal)`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          to="/admin/questions" 
          className="text-blue-400 hover:text-blue-300"
        >
          Manage all questions →
        </Link>
      </div>
    </div>
  );
};

QuestionManagement.propTypes = {
  questions: PropTypes.array.isRequired
};

export default QuestionManagement;
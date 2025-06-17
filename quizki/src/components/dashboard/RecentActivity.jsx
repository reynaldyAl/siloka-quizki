// components/dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const RecentActivity = ({ answers }) => {
  if (!answers || answers.length === 0) {
    return null;
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-4">
      {answers.map(answer => (
        <div 
          key={answer.id} 
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
        >
          <Link to={`/questions/${answer.question_id}`} className="block">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {answer.is_correct ? (
                  <div className="bg-green-500 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-red-500 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">Question #{answer.question_id}</p>
                  <p className="text-gray-400 text-sm">{formatDate(answer.created_at)}</p>
                </div>
              </div>
              <span className={`${answer.is_correct ? 'text-green-400' : 'text-red-400'} font-medium`}>
                {answer.is_correct ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

RecentActivity.propTypes = {
  answers: PropTypes.array.isRequired
};

export default RecentActivity;
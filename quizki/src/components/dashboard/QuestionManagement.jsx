// components/dashboard/QuestionManagement.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const QuestionManagement = ({ questions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter questions based on search term
  const filteredQuestions = questions.filter(question => 
    question.question_text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDelete = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(questionId);
      setError(null);
      
      await api.delete(`/questions/${questionId}`);
      
      // Remove the question from the list (would be better to refetch, but this is a quick update)
      window.location.reload();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. Please try again.');
    } finally {
      setDeleting(null);
    }
  };
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <Link 
          to="/admin/create-question"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          Add New
        </Link>
      </div>
      
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? 'No questions match your search.' : 'No questions available.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredQuestions.map(question => (
                <tr key={question.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-normal">
                    <div className="text-sm text-white">{question.question_text}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-white">{question.category || 'General'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${question.difficulty === 'easy' ? 'bg-green-800 text-green-200' : 
                        question.difficulty === 'medium' ? 'bg-yellow-800 text-yellow-200' : 
                        'bg-red-800 text-red-200'}`}>
                      {question.difficulty || 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link to={`/admin/edit-question/${question.id}`} className="text-blue-400 hover:text-blue-300">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(question.id)}
                        disabled={deleting === question.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deleting === question.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
// src/components/dashboard/QuizManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  
  useEffect(() => {
    fetchQuizzes();
  }, []);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };
  
  const openDeleteModal = (quizId) => {
    setQuizToDelete(quizId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setQuizToDelete(null);
  };
  
  const handleDelete = async () => {
    if (!quizToDelete) return;
    
    try {
      setDeleting(quizToDelete);
      await api.delete(`/quizzes/${quizToDelete}`);
      fetchQuizzes(); // Reload the list
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz');
    } finally {
      setDeleting(null);
    }
  };
  
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateQuiz = () => {
    navigate('/admin/create-quiz');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemType="Quiz"
        title="Delete Quiz"
      />
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search quizzes..."
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
        
        <button 
          onClick={handleCreateQuiz}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          Create Quiz
        </button>
      </div>
      
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? 'No quizzes match your search.' : 'No quizzes available.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredQuizzes.map(quiz => (
                <tr key={quiz.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-normal">
                    <div className="text-sm text-white">{quiz.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{quiz.description?.substring(0, 50)}{quiz.description?.length > 50 ? '...' : ''}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-white">{quiz.category || 'General'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-white">{quiz.questions?.length || 0}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${quiz.difficulty === 'easy' ? 'bg-green-800 text-green-200' : 
                        quiz.difficulty === 'medium' ? 'bg-yellow-800 text-yellow-200' : 
                        'bg-red-800 text-red-200'}`}>
                      {quiz.difficulty || 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/edit-quiz/${quiz.id}`)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteModal(quiz.id)}
                        disabled={deleting === quiz.id}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deleting === quiz.id ? 'Deleting...' : 'Delete'}
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

export default QuizManagement;
// src/components/dashboard/QuestionManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

const QuestionManagement = ({ questions = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Update filtered questions when questions change (filtering happens at parent level)
  useEffect(() => {
    setFilteredQuestions(questions);
  }, [questions]);

  const openDeleteModal = (questionId) => {
    setQuestionToDelete(questionId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      setDeleting(questionToDelete);
      await api.delete(`/questions/${questionToDelete}`);
      setFilteredQuestions(prev => prev.filter(q => q.id !== questionToDelete));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (questionId) => {
    navigate(`/admin/edit-question/${questionId}`);
  };

  const handleCreateQuestion = () => {
    navigate('/admin/create-question');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemType="Question"
      />
      
      {/* Top section with Add New button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Question List</h2>
        <button 
          onClick={handleCreateQuestion}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          Add New
        </button>
      </div>
      
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          No questions available.
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Question</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
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
                      <button
                        onClick={() => handleEdit(question.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteModal(question.id)}
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
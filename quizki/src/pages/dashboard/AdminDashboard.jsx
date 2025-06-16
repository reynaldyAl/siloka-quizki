// pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import UserManagement from '../../components/dashboard/UserManagement';
import QuestionManagement from '../../components/dashboard/QuestionManagement';
import api from '../../services/api';

const AdminDashboard = ({ user, questions, userAnswers, totalQuizzesTaken, averageScore }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setAllUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return (
    <div className="dashboard-container p-6 max-w-7xl mx-auto">
      <div className="welcome-banner mb-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl overflow-hidden shadow-lg">
        <div className="stars-bg small absolute inset-0 opacity-20"></div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-red-100">
                Logged in as <span className="font-bold text-white">{user.username}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <Link 
                to="/admin/create-question" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Question
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={allUsers.length}
          icon="users"
          color="blue"
        />
        <StatCard
          title="Total Questions"
          value={questions.length}
          icon="question"
          color="purple"
        />
        <StatCard
          title="Total Answers"
          value={userAnswers.length}
          icon="answers"
          color="green"
        />
        <StatCard
          title="Avg. User Score"
          value={`${averageScore}%`}
          icon="score"
          color="orange"
        />
      </div>
      
      <div className="md:hidden mb-6">
        <Link 
          to="/admin/create-question" 
          className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-3 rounded-lg font-bold flex items-center justify-center w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Question
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
          <UserManagement users={allUsers} loading={loadingUsers} />
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Question Management</h2>
          <QuestionManagement questions={questions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
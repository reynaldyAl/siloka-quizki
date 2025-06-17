// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Dashboard.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get current user data
        const userResponse = await api.get('/me');
        setUser(userResponse.data);

        // Get user's answers
        const answersResponse = await api.get('/my-answers');
        setUserAnswers(answersResponse.data);

        // Get available questions
        const questionsResponse = await api.get('/questions');
        setQuestions(questionsResponse.data);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container p-4">
        <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuizzesTaken = new Set(userAnswers.map(answer => answer.question_id)).size;
  
  const correctAnswers = userAnswers.filter(answer => answer.is_correct).length;
  const averageScore = userAnswers.length > 0 
    ? Math.round((correctAnswers / userAnswers.length) * 100) 
    : 0;

  // Render different dashboard based on user role
  return user?.role === 'admin' ? (
    <AdminDashboard 
      user={user}
      questions={questions}
      userAnswers={userAnswers}
      totalQuizzesTaken={totalQuizzesTaken}
      averageScore={averageScore}
    />
  ) : (
    <UserDashboard 
      user={user}
      questions={questions}
      userAnswers={userAnswers}
      totalQuizzesTaken={totalQuizzesTaken}
      averageScore={averageScore}
    />
  );
};

export default DashboardPage;
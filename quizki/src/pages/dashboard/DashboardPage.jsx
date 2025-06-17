import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]); // Added quizzes state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Try to get all data but handle individual request failures
      let userData = null;
      let answersData = [];
      let questionsData = [];
      let quizzesData = [];
      
      try {
        const userResponse = await api.get('/me');
        userData = userResponse.data;
        setUser(userData);
      } catch (userErr) {
        console.error("Failed to fetch user data:", userErr);
        if (userErr.response?.status === 401) {
          navigate('/login');
          return;
        }
      }
      
      try {
        const answersResponse = await api.get('/my-answers');
        answersData = answersResponse.data || [];
        setUserAnswers(answersData);
      } catch (answersErr) {
        console.error("Failed to fetch answers:", answersErr);
      }
      
      try {
        const questionsResponse = await api.get('/questions');
        questionsData = questionsResponse.data || [];
        setQuestions(questionsData);
      } catch (questionsErr) {
        console.error("Failed to fetch questions:", questionsErr);
      }
      
      // Added quizzes fetch
      try {
        const quizzesResponse = await api.get('/quizzes');
        quizzesData = quizzesResponse.data || [];
        setQuizzes(quizzesData);
      } catch (quizzesErr) {
        console.error("Failed to fetch quizzes:", quizzesErr);
      }
      
      // If we couldn't get user data but got past the 401 check,
      // something is wrong with the backend
      if (!userData) {
        setError('Failed to load user data. Please try again.');
      }
      
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
            onClick={fetchDashboardData} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-container p-4">
        <div className="bg-orange-900 bg-opacity-20 border border-orange-500 text-orange-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Session Error</h2>
          <p>Unable to load your user profile. Please try logging in again.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics safely
  const totalQuizzesTaken = new Set(userAnswers.map(answer => answer.question_id)).size;
  
  // Safely check for is_correct property which might not exist
  const correctAnswers = userAnswers.filter(answer => answer?.score > 0).length;
  const averageScore = userAnswers.length > 0 
    ? Math.round((correctAnswers / userAnswers.length) * 100) 
    : 0;

  // Render different dashboard based on user role
  return user.role === 'admin' ? (
    <AdminDashboard 
      user={user}
      questions={questions}
      userAnswers={userAnswers}
      totalQuizzesTaken={totalQuizzesTaken}
      averageScore={averageScore}
      onRefresh={fetchDashboardData}
    />
  ) : (
    <UserDashboard 
      user={user}
      questions={questions}
      userAnswers={userAnswers}
      quizzes={quizzes}
      totalQuizzesTaken={totalQuizzesTaken}
      averageScore={averageScore}
      onRefresh={fetchDashboardData}
    />
  );
};

export default DashboardPage;
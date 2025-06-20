// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import UserManagement from '../../components/dashboard/UserManagement';
import QuestionManagement from '../../components/dashboard/QuestionManagement';
import QuizManagement from '../../components/dashboard/QuizManagement'; 
import UserFilter from '../../components/dashboard/filters/UserFilter';
import QuestionFilter from '../../components/dashboard/filters/QuestionFilter';
import { 
  filterUsers, 
  filterQuestions,
  extractQuestionCategories
} from '../../services/FilterService';
import api from '../../services/api';

const AdminDashboard = ({ user, questions }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); 
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger data refresh
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  // Filter states
  const [userFilters, setUserFilters] = useState(null);
  const [questionFilters, setQuestionFilters] = useState(null);
  
  // Filtered data
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [questionCategories, setQuestionCategories] = useState([]);
  
  const navigate = useNavigate();
  
  // Notification system
  const showToast = (message) => {
    setNotificationMsg(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  useEffect(() => {
    console.log("Admin Dashboard - Current user:", user);
    
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await api.get('/users');
        setAllUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        
        // Set questions and extract categories
        setFilteredQuestions(questions);
        const categories = extractQuestionCategories(questions);
        setQuestionCategories(categories);
        
        // Fetch admin statistics
        try {
          const statsResponse = await api.get('/admin/statistics');
          console.log("Admin statistics:", statsResponse.data);
          setTotalAnswers(statsResponse.data.total_answers);
          setAverageScore(statsResponse.data.average_score);
        } catch (err) {
          console.error("Error fetching admin statistics:", err);
          
          // Fallback to client-side calculation if endpoint fails
          let totalScore = 0;
          let validUserCount = 0;
          
          for (const user of usersResponse.data) {
            if (user.total_score) {
              totalScore += Math.min(100, Math.max(0, user.total_score));
              validUserCount++;
            }
          }
          
          const avgScore = validUserCount > 0 
            ? Math.round(totalScore / validUserCount)
            : 0;
          setAverageScore(avgScore);
          
          // Estimate answers
          setTotalAnswers(Math.round(usersResponse.data.length * questions.length * 0.7));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchData();
  }, [user, questions, refreshKey]);
  
  // Apply filters when they change
  useEffect(() => {
    if (allUsers.length > 0 && userFilters) {
      setFilteredUsers(filterUsers(allUsers, userFilters));
    }
  }, [allUsers, userFilters]);
  
  useEffect(() => {
    if (questions.length > 0 && questionFilters) {
      setFilteredQuestions(filterQuestions(questions, questionFilters));
    }
  }, [questions, questionFilters]);
  
  const handleCreateQuestion = () => {
    console.log("Navigating to create question");
    navigate('/admin/create-question');
  };
  
  const handleCreateQuiz = () => {
    console.log("Navigating to create quiz");
    navigate('/admin/create-quiz');
  };
  
  const handleRefreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setLoadingUsers(true);
    showToast('Dashboard data refreshed!');
  };
  
  return (
    <div className="dashboard-container p-6 max-w-7xl mx-auto space-y-6">
      {/* Notification Toast */}
      <div 
        className={`fixed top-20 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        {notificationMsg}
      </div>
      
      {/* Welcome Banner */}
      <div className="welcome-banner relative bg-gradient-to-r from-red-600 to-purple-600 rounded-xl overflow-hidden shadow-xl">
        <div className="stars-bg small absolute inset-0 opacity-20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
            <path fill="#FFFFFF" d="M47.1,-61.3C61.2,-52.2,72.8,-38.6,79.6,-22.1C86.4,-5.7,88.3,13.5,82.1,30.1C75.9,46.8,61.5,61,45.1,72.7C28.7,84.4,10.2,93.6,-7.3,92.1C-24.8,90.5,-41.3,78.2,-54.1,64C-67,49.8,-76.1,33.8,-81.9,15.1C-87.7,-3.6,-90.1,-25.1,-83,-42.8C-75.8,-60.5,-59.1,-74.4,-41.5,-82C-24,-89.6,-5.5,-90.9,9.9,-86.3C25.3,-81.7,33,-70.3,47.1,-61.3Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mr-3">
                  {user.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-red-100 text-lg">
                    Logged in as <span className="font-bold text-white">{user.username || 'Admin'}</span>
                  </p>
                  <p className="text-red-200 text-sm">
                    {user.role === 'admin' ? 'Administrator Access' : 'Limited Access'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
              <button 
                onClick={handleRefreshData}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              <button 
                onClick={handleCreateQuestion}
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Question
              </button>
              <button 
                onClick={handleCreateQuiz}
                className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded-lg font-bold flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Total Users"
            value={allUsers.length}
            icon="users"
            color="blue"
            trend="+12% ↑"
          />
        </div>
        
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Total Questions"
            value={questions.length}
            icon="question"
            color="purple"
            trend="+5% ↑"
          />
        </div>
        
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Total Answers"
            value={totalAnswers}
            icon="answers"
            color="green"
            trend="+18% ↑"
          />
        </div>
        
        <div className="transform hover:scale-105 transition-transform duration-300">
          <StatCard
            title="Avg. User Score"
            value={`${averageScore}%`}
            icon="score"
            color="orange"
            trend="+3% ↑"
          />
        </div>
      </div>
      
      {/* Mobile action buttons */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        <button
          onClick={handleCreateQuestion} 
          className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-3 rounded-lg font-bold flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Question
        </button>
        <button
          onClick={handleCreateQuiz} 
          className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-3 rounded-lg font-bold flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Quiz
        </button>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-700">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 font-medium flex items-center whitespace-nowrap transition-all duration-200 ${
              activeTab === 'users' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-6 font-medium flex items-center whitespace-nowrap transition-all duration-200 ${
              activeTab === 'questions' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Questions
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-3 px-6 font-medium flex items-center whitespace-nowrap transition-all duration-200 ${
              activeTab === 'quizzes' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Quizzes
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg"
        key={activeTab} // This forces a re-render when tab changes
      >
        <div className="p-6">
          {activeTab === 'users' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
              <UserFilter onFilterChange={setUserFilters} />
              <div className="mt-4">
                <UserManagement users={filteredUsers} loading={loadingUsers} />
              </div>
            </>
          )}
          
          {activeTab === 'questions' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Question Management</h2>
              <QuestionFilter 
                onFilterChange={setQuestionFilters} 
                categories={questionCategories}
              />
              <div className="mt-4">
                <QuestionManagement questions={filteredQuestions} />
              </div>
            </>
          )}
          
          {activeTab === 'quizzes' && (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Quiz Management</h2>
              <QuizManagement />
            </>
          )}
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
// pages/dashboard/UserDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import AvailableQuizzes from '../../components/dashboard/AvailableQuizzes';

const UserDashboard = ({ user, questions, userAnswers, totalQuizzesTaken, averageScore }) => {
  // Find questions that user hasn't answered yet
  const answeredQuestionIds = new Set(userAnswers.map(answer => answer.question_id));
  const availableQuestions = questions.filter(question => !answeredQuestionIds.has(question.id));
  
  // Get recent activity (last 5 answers)
  const recentAnswers = [...userAnswers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  
  // Calculate user rank based on score and questions taken
  const getUserRank = (score, quizzesTaken) => {
    if (quizzesTaken === 0) return "Novice";
    if (score >= 90 && quizzesTaken >= 10) return "Quiz Master";
    if (score >= 75 && quizzesTaken >= 5) return "Quiz Expert";
    if (score >= 60) return "Quiz Enthusiast";
    return "Quiz Apprentice";
  };

  const userRank = getUserRank(averageScore, totalQuizzesTaken);

  return (
    <div className="dashboard-container p-6 max-w-7xl mx-auto">
      <div className="welcome-banner mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden shadow-lg">
        <div className="stars-bg small absolute inset-0 opacity-20"></div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.username}!</h1>
          <p className="text-blue-100">
            Your current rank: <span className="font-bold text-white">{userRank}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Quizzes Taken"
          value={totalQuizzesTaken}
          icon="quiz"
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          icon="score"
          color="green"
        />
        <StatCard
          title="Questions Available"
          value={availableQuestions.length}
          icon="question"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <RecentActivity answers={recentAnswers} />
          
          {recentAnswers.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>You haven't taken any quizzes yet.</p>
              <p className="mt-2">Start answering questions to see your activity here!</p>
            </div>
          )}
          
          {recentAnswers.length > 0 && (
            <Link 
              to="/history" 
              className="block text-center mt-4 text-blue-400 hover:text-blue-300"
            >
              View all activity →
            </Link>
          )}
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Available Quizzes</h2>
          <AvailableQuizzes questions={availableQuestions} />
          
          {availableQuestions.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>You've completed all available quizzes!</p>
              <p className="mt-2">Check back later for new content.</p>
            </div>
          )}
          
          <Link 
            to="/quizzes" 
            className="block text-center mt-4 text-blue-400 hover:text-blue-300"
          >
            Browse all quizzes →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
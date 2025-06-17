// pages/dashboard/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import AvailableQuizzes from '../../components/dashboard/AvailableQuizzes';
import quizService from '../../services/quizService';
import userService from '../../services/userService';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({});
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [totalQuizzesTaken, setTotalQuizzesTaken] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const location = useLocation();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user data
      try {
        const userData = await userService.getCurrentUser();
        console.log("User data:", userData);
        setUser(userData || { username: 'User' });
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        // Don't set error yet, try to continue with other data
      }
      
      // Get all questions with error handling
      try {
        const allQuestions = await quizService.getAllQuestions();
        console.log("Questions data:", allQuestions);
        setQuestions(allQuestions || []);
      } catch (questionsError) {
        console.error("Error fetching questions:", questionsError);
        setQuestions([]);
      }
      
      // Get user answers with error handling
      let answersData = [];
      try {
        answersData = await quizService.getUserAnswers();
        console.log("User answers:", answersData);
        setUserAnswers(answersData || []);
      } catch (answersError) {
        console.error("Error fetching user answers:", answersError);
        setUserAnswers([]);
      }
      
      // Get all quizzes with error handling
      try {
        const allQuizzes = await quizService.getQuizzes();
        console.log("Quizzes data:", allQuizzes);
        setQuizzes(allQuizzes || []);
        
        // Calculate derived stats if we have some data
        if (answersData && answersData.length > 0 && allQuizzes && allQuizzes.length > 0) {
          calculateStats(answersData, allQuizzes);
        } else {
          console.log("Not enough data to calculate stats");
          setTotalQuizzesTaken(0);
          setAverageScore(0);
        }
      } catch (quizzesError) {
        console.error("Error fetching quizzes:", quizzesError);
        setQuizzes([]);
      }
      
    } catch (err) {
      console.error("General error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics based on answers and quizzes
  const calculateStats = (answers, quizzes) => {
    console.log("Calculating stats with:", { 
      answerCount: answers.length, 
      quizCount: quizzes.length 
    });
    
    // Check if answers array is empty or undefined
    if (!answers || answers.length === 0) {
      console.log("No answers available to calculate stats");
      setTotalQuizzesTaken(0);
      setAverageScore(0);
      return;
    }
    
    // Group answers by quiz
    const quizAnswers = {};
    
    answers.forEach(answer => {
      // Ensure required fields exist
      if (!answer.question_id) {
        console.warn("Answer missing question_id:", answer);
        return;
      }
      
      const quizId = findQuizForQuestion(answer.question_id, quizzes);
      if (!quizId) {
        console.warn(`Could not find quiz for question ${answer.question_id}`);
        return;
      }
      
      if (!quizAnswers[quizId]) {
        quizAnswers[quizId] = {
          answers: [],
          correctAnswers: 0,
          date: answer.created_at || new Date().toISOString()
        };
      }
      
      quizAnswers[quizId].answers.push(answer);
      
      // Check if is_correct exists and is true
      if (answer.is_correct === true) {
        quizAnswers[quizId].correctAnswers += 1;
      }
    });
    
    console.log("Processed quiz answers:", quizAnswers);
    
    // Calculate total quizzes taken
    const uniqueQuizzesTaken = Object.keys(quizAnswers).length;
    setTotalQuizzesTaken(uniqueQuizzesTaken);
    
    // Calculate average score
    if (uniqueQuizzesTaken > 0) {
      let totalScore = 0;
      Object.values(quizAnswers).forEach(quiz => {
        const quizScore = quiz.answers.length > 0 
          ? (quiz.correctAnswers / quiz.answers.length) * 100 
          : 0;
        totalScore += quizScore;
      });
      
      const finalAverage = Math.round(totalScore / uniqueQuizzesTaken);
      setAverageScore(finalAverage);
      
      console.log("Final stats calculated:", {
        quizzesTaken: uniqueQuizzesTaken,
        averageScore: finalAverage
      });
    } else {
      setAverageScore(0);
    }
  };
  
  // Find which quiz a question belongs to
  const findQuizForQuestion = (questionId, quizzes) => {
    // Convert questionId to number if it's a string
    const qId = typeof questionId === 'string' ? parseInt(questionId, 10) : questionId;
    
    for (const quiz of quizzes) {
      // Check if this quiz contains the question
      if (quiz.questions && Array.isArray(quiz.questions)) {
        // First try direct comparison
        if (quiz.questions.includes(qId)) {
          console.log(`Found question ${qId} in quiz ${quiz.id}`);
          return quiz.id;
        }
        
        // Then try string comparison for safety
        if (quiz.questions.some(id => String(id) === String(questionId))) {
          console.log(`Found question ${questionId} (string comparison) in quiz ${quiz.id}`);
          return quiz.id;
        }
      }
    }
    
    // Fallback for lists of question objects instead of IDs
    for (const quiz of quizzes) {
      if (quiz.questionDetails && Array.isArray(quiz.questionDetails)) {
        for (const question of quiz.questionDetails) {
          if (question.id === qId || String(question.id) === String(questionId)) {
            console.log(`Found question ${questionId} in quiz ${quiz.id} (via questionDetails)`);
            return quiz.id;
          }
        }
      }
    }
    
    // If we can't find the quiz, as a last resort use the first quiz
    if (quizzes.length > 0) {
      console.warn(`Could not find quiz for question ${questionId}, using first quiz as fallback`);
      return quizzes[0].id;
    }
    
    console.log(`Question ${questionId} not found in any quiz`);
    return null;
  };

  // Effect to fetch data on initial load or when returning from quiz results
  useEffect(() => {
    console.log("Dashboard mounting or location state changed");
    fetchDashboardData();
    
    // Check if we're coming back from quiz results page
    const refreshDashboard = location.state?.refreshDashboard;
    if (refreshDashboard) {
      console.log("Refreshing dashboard after quiz completion");
      fetchDashboardData();
    }
  }, [location.state]);

  // Find questions that user hasn't answered yet
  const getAvailableQuestions = () => {
    // Need to defensively handle the case where answers or questions aren't loaded
    if (!userAnswers || !questions || !Array.isArray(userAnswers) || !Array.isArray(questions)) {
      return [];
    }

    const answeredQuestionIds = new Set(userAnswers.map(answer => 
      typeof answer.question_id === 'string' 
        ? parseInt(answer.question_id, 10) 
        : answer.question_id
    ));
    
    return questions.filter(question => {
      if (!question || !question.id) return false;
      
      const questionId = typeof question.id === 'string' 
        ? parseInt(question.id, 10) 
        : question.id;
      return !answeredQuestionIds.has(questionId);
    });
  };
  
  const availableQuestions = getAvailableQuestions();
  
  // Get recent activity (last 5 answers)
  const getRecentAnswers = () => {
    // Defensively handle the case where answers aren't loaded
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return [];
    }
    
    return [...userAnswers]
      .sort((a, b) => {
        // Handle potentially missing created_at field
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);
  };
  
  const recentAnswers = getRecentAnswers();
  
  // Calculate user rank based on score and questions taken
  const getUserRank = (score, quizzesTaken) => {
    if (quizzesTaken === 0) return "Novice";
    if (score >= 90 && quizzesTaken >= 10) return "Quiz Master";
    if (score >= 75 && quizzesTaken >= 5) return "Quiz Expert";
    if (score >= 60) return "Quiz Enthusiast";
    return "Quiz Apprentice";
  };

  const userRank = getUserRank(averageScore, totalQuizzesTaken);

  if (loading) {
    return (
      <div className="dashboard-container p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p className="text-white mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container p-6 max-w-7xl mx-auto">
        <div className="bg-red-900/50 border border-red-700 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-200">{error}</p>
          <div className="mt-4 p-3 bg-gray-800 rounded text-gray-300 text-sm overflow-auto">
            <pre>Debug Info: Using React {React.version}</pre>
            <pre>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</pre>
            <pre>User data: {JSON.stringify(user, null, 2)}</pre>
          </div>
          <button 
            onClick={fetchDashboardData} 
            className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-6 max-w-7xl mx-auto">
      <div className="welcome-banner mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden shadow-lg relative">
        <div className="stars-bg small absolute inset-0 opacity-20"></div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.username || 'Explorer'}!</h1>
          <p className="text-blue-100">
            Your current rank: <span className="font-bold text-white">{userRank}</span>
          </p>
          <p className="text-blue-200 text-sm mt-1">
            Stats: {totalQuizzesTaken} quizzes taken, {averageScore}% average score
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100"
          title="Refresh dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
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
          <RecentActivity answers={recentAnswers} questions={questions} />
          
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
          <AvailableQuizzes questions={availableQuestions} quizzes={quizzes} />
          
          {availableQuestions.length === 0 && quizzes.length > 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>You've completed all available quizzes!</p>
              <p className="mt-2">Check back later for new content.</p>
            </div>
          )}
          
          {quizzes.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>No quizzes available at the moment.</p>
              <p className="mt-2">Please check back later.</p>
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
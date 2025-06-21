import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import './QuizDetailPage.css';

const QuizDetailPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Default image from Unsplash - space/cosmos themed for quizzes
  const defaultQuizImage = "https://images.unsplash.com/photo-1459909633680-206dc5c67abb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch quiz data
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        const quizData = await quizService.getQuizById(quizId);
        setQuiz(quizData);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleStartQuiz = () => {
    if (!user) {
      // If user is not logged in, redirect to login
      navigate('/login', { state: { from: `/quizzes/${quizId}` } });
    } else {
      // If user is logged in, navigate to take quiz
      navigate(`/quizzes/${quizId}/take`);
    }
  };

  if (loading) {
    return (
      <div className="quiz-detail-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="stars-bg large"></div>
        <div className="quiz-detail-content loading">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p>Loading quiz details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-detail-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="stars-bg large"></div>
        <div className="quiz-detail-content">
          <div className="quiz-error">
            <h2>Houston, we have a problem</h2>
            <p>{error || "Quiz not found"}</p>
            <Link to="/quizzes" className="error-action-button">
              Return to Quiz List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get time limit value with fallback
  const timeLimit = quiz.timeLimit || quiz.time_limit || quiz.timeLimitMinutes || 'N/A';
  
  // Get question count with fallback
  const questionCount = quiz.questionCount || quiz.question_count || 
    (quiz.questions && quiz.questions.length) || 'N/A';

  return (
    <div className="quiz-detail-container">
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>

      <div className="quiz-detail-content">
        <div className="quiz-header">
          <div className="quiz-thumbnail">
            {/* Default quiz image from Unsplash */}
            <img src={defaultQuizImage} alt="Quiz background" className="quiz-image" />
            <div className="quiz-difficulty">
              <span className={`difficulty-badge difficulty-${quiz.difficulty?.toLowerCase()}`}>
                {quiz.difficulty}
              </span>
            </div>
          </div>
          
          <div className="quiz-info">
            <h1>{quiz.title}</h1>
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-meta">
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{timeLimit} minutes</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{questionCount} Questions</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Category: {quiz.category}</span>
              </div>
            </div>
            
            <div className="quiz-actions">
              <button 
                className="start-quiz-button"
                onClick={handleStartQuiz}
              >
                Start Quiz
              </button>
      {/* Back to List Button at top left */}
      <Link to="/quizzes" className="back-button">
        <span>Back to List</span>
      </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
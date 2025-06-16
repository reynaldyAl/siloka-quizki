import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import Button from '../../components/common/Button/Button';
import './QuizDetailPage.css';

const QuizDetailPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

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
        // For demo purposes, we're using mock data
        // In a real app, you would fetch data from your API
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
        
        // Mock quiz data
        const mockQuiz = {
          id: quizId,
          title: "Space Exploration Quiz",
          description: "Test your knowledge about the universe, planets, and space exploration missions.",
          thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop",
          category: "Astronomy",
          difficulty: "Intermediate",
          questionCount: 10,
          estimatedTime: "15 minutes",
          creator: "SpaceExplorer42",
          createdAt: "2025-05-10T12:00:00Z",
          attempts: 234,
          avgScore: 74,
          tags: ["space", "astronomy", "planets", "nasa"]
        };
        
        setQuiz(mockQuiz);
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
      navigate('/login', { state: { from: `/quiz/${quizId}` } });
    } else {
      // If user is logged in, navigate to take quiz
      navigate(`/quiz/${quizId}/take`);
    }
  };

  if (loading) {
    return (
      <div className="quiz-detail-container">
        <Navbar />
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
        <Navbar />
        <div className="quiz-detail-content">
          <div className="quiz-error">
            <h2>Houston, we have a problem</h2>
            <p>{error || "Quiz not found"}</p>
            <Link to="/quizzes">
              <Button variant="secondary" theme="space">
                Return to Quiz List
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-detail-container">
      <Navbar />
      
      {/* Star background */}
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>

      <div className="quiz-detail-content">
        <div className="quiz-header">
          <div className="quiz-thumbnail">
            <img src={quiz.thumbnail} alt={quiz.title} />
            <div className="quiz-difficulty">
              <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>
                {quiz.difficulty}
              </span>
            </div>
          </div>
          
          <div className="quiz-info">
            <h1>{quiz.title}</h1>
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-meta">
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{quiz.estimatedTime}</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{quiz.questionCount} Questions</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Created by {quiz.creator}</span>
              </div>
            </div>

            <div className="quiz-stats">
              <div className="stat-item">
                <div className="stat-value">{quiz.attempts}</div>
                <div className="stat-label">Attempts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{quiz.avgScore}%</div>
                <div className="stat-label">Avg. Score</div>
              </div>
            </div>
            
            <div className="quiz-tags">
              {quiz.tags.map(tag => (
                <span key={tag} className="quiz-tag">{tag}</span>
              ))}
            </div>
            
            <div className="quiz-actions">
              <Button 
                variant="primary" 
                theme="space"
                size="large"
                onClick={handleStartQuiz}
                className="start-quiz-button"
              >
                Start Quiz
              </Button>
              <Link to="/quizzes">
                <Button variant="secondary" theme="space">
                  Back to List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
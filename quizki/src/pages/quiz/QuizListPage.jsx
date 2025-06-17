// src/pages/quiz/QuizListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import './QuizListPage.css';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch quizzes (transformed from questions in the API)
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const quizData = await quizService.getQuizzes();
        setQuizzes(quizData);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-list-content">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p>Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-list-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-list-content">
          <div className="quiz-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>
      
      <div className="quiz-list-content">
        <h1>Available Quizzes</h1>
        <p className="quiz-list-subtitle">Test your knowledge with these cosmic challenges</p>
        
        <div className="quiz-list">
          {quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <h2 className="quiz-card-title">{quiz.title}</h2>
                <p className="quiz-card-description">{quiz.description}</p>
                
                <div className="quiz-card-meta">
                  <div className="quiz-card-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>{quiz.questionCount} Questions</span>
                  </div>
                  <div className="quiz-card-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="quiz-card-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className={`difficulty-${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
                  </div>
                </div>
                
                <div className="quiz-card-action">
                  <Link to={`/quizzes/${quiz.id}`} className="view-quiz-btn">
                    View Quiz
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No quizzes available at the moment.</p>
              <p className="empty-subtext">Check back later for new content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizListPage;
// src/pages/quiz/QuizResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import quizService from '../../services/quizService';
import './QuizResultsPage.css';

const QuizResultsPage = () => {
  const { id: quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if results are passed via location state
    if (location.state?.results) {
      setResults(location.state.results);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch results from API
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Get quiz info
        const quiz = await quizService.getQuizById(quizId);
        
        // Get user's answers for this quiz
        const userAnswers = await quizService.getUserAnswers();
        
        // Filter answers for this quiz's questions
        const quizQuestionIds = quiz.questions;
        const relevantAnswers = userAnswers.filter(answer => 
          quizQuestionIds.includes(answer.question_id)
        );
        
        // Get question details for all questions in this quiz
        const questionPromises = quizQuestionIds.map(qId => 
          quizService.getQuestionById(qId)
        );
        
        const questions = await Promise.all(questionPromises);
        
        // Build results data
        const correctAnswers = relevantAnswers.filter(answer => answer.is_correct);
        
        // Create mock time spent (since we don't have this from API)
        const randomMins = Math.floor(Math.random() * 10) + 5; 
        const randomSecs = Math.floor(Math.random() * 60);
        const timeSpent = `${String(randomMins).padStart(2, '0')}:${String(randomSecs).padStart(2, '0')}`;
        
        const resultsData = {
          quizId,
          quizTitle: quiz.title,
          score: correctAnswers.length,
          totalQuestions: questions.length,
          timeSpent,
          passingScore: Math.ceil(questions.length * 0.6), // 60% passing score
          dateTaken: new Date().toISOString(),
          questions: questions.map(question => {
            // Find this question's answer
            const answer = relevantAnswers.find(a => a.question_id === question.id);
            
            // Find the user's chosen answer
            const userChoice = answer ? 
              question.choices.find(c => c.id === answer.choice_id) : 
              null;
            
            // Find the correct choice
            const correctChoice = question.choices.find(choice => {
              if (choice.is_correct === true) return true;
              
              // Fallback logic if is_correct is hidden
              const answerForThisChoice = relevantAnswers.find(
                a => a.question_id === question.id && a.choice_id === choice.id
              );
              return answerForThisChoice?.is_correct === true;
            });
            
            return {
              id: question.id,
              question: question.text,
              userAnswer: userChoice ? userChoice.text : "Not answered",
              correctAnswer: correctChoice ? correctChoice.text : "Unknown",
              isCorrect: answer?.is_correct === true
            };
          })
        };
        
        setResults(resultsData);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load quiz results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.state, quizId]);

  const handleRetakeQuiz = () => {
    navigate(`/quizzes/${quizId}/take`);
  };

  // Calculate percentage
  const calculatePercentage = () => {
    if (!results) return 0;
    return (results.score / results.totalQuestions) * 100;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get result status
  const getResultStatus = () => {
    if (!results) return {};
    
    const percentage = calculatePercentage();
    if (percentage >= 80) {
      return {
        status: "Stellar Performance!",
        icon: "🌟",
        class: "excellent",
        message: "You're a cosmic genius! Your knowledge is out of this world!"
      };
    } else if (percentage >= 60) {
      return {
        status: "Mission Accomplished!",
        icon: "🚀",
        class: "good",
        message: "You've successfully navigated through space knowledge!"
      };
    } else if (percentage >= results.passingScore / results.totalQuestions * 100) {
      return {
        status: "Mission Complete",
        icon: "🌌",
        class: "pass",
        message: "You passed the test! Keep exploring to improve your knowledge."
      };
    } else {
      return {
        status: "Course Correction Needed",
        icon: "🔭",
        class: "fail",
        message: "You didn't quite make it this time. Ready for another attempt?"
      };
    }
  };

  if (loading) {
    return (
      <div className="quiz-results-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-results-content loading">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p>Calculating results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="quiz-results-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-results-content">
          <div className="results-error">
            <h2>Results Unavailable</h2>
            <p>{error || "Could not find quiz results"}</p>
            <Link to="/quizzes">
              <Button variant="secondary" theme="space">
                Back to Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resultStatus = getResultStatus();

  return (
    <div className="quiz-results-container">
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>

      <div className="quiz-results-content">
        <div className="results-card">
          <div className="results-header">
            <div className="results-title">
              <h1>{results.quizTitle} - Results</h1>
              <p className="results-date">Completed on {formatDate(results.dateTaken)}</p>
            </div>
            
            <div className={`results-status ${resultStatus.class}`}>
              <div className="status-icon">{resultStatus.icon}</div>
              <h2>{resultStatus.status}</h2>
              <p>{resultStatus.message}</p>
            </div>
            
            <div className="results-summary">
              <div className="results-score">
                <div className="score-circle">
                  <div className="score-circle-inner">
                    <span className="score-number">{results.score}</span>
                    <span className="score-total">/{results.totalQuestions}</span>
                  </div>
                  <svg viewBox="0 0 36 36" className="score-circle-svg">
                    <path
                      className="score-circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`score-circle-fill ${resultStatus.class}`}
                      strokeDasharray={`${calculatePercentage()}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <div className="score-percent">{Math.round(calculatePercentage())}%</div>
              </div>
              
              <div className="results-stats">
                <div className="stat-item">
                  <div className="stat-label">Time Spent</div>
                  <div className="stat-value">{results.timeSpent}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Passing Score</div>
                  <div className="stat-value">{results.passingScore}/{results.totalQuestions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Status</div>
                  <div className={`stat-value ${calculatePercentage() >= (results.passingScore / results.totalQuestions) * 100 ? 'passed' : 'failed'}`}>
                    {calculatePercentage() >= (results.passingScore / results.totalQuestions) * 100 ? 'PASSED' : 'FAILED'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="results-questions">
            <h3>Question Review</h3>
            
            <div className="questions-list">
              {results.questions.map(question => (
                <div key={question.id} className={`question-item ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <div className="question-number">Q{question.id}</div>
                    <div className={`question-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                      {question.isCorrect ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="question-text">{question.question}</div>
                  
                  <div className="question-answers">
                    <div className="answer-item">
                      <span className="answer-label">Your Answer:</span>
                      <span className={`answer-text ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                        {question.userAnswer}
                      </span>
                    </div>
                    
                    {!question.isCorrect && (
                      <div className="answer-item">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-text correct">
                          {question.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="results-actions">
            <Button
              variant="primary"
              theme="space"
              onClick={handleRetakeQuiz}
            >
              Retake Quiz
            </Button>
            <Link to={`/quizzes/${quizId}`}>
              <Button variant="secondary" theme="space">
                Quiz Details
              </Button>
            </Link>
            <Link to="/quizzes">
              <Button variant="secondary" theme="space">
                Browse Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
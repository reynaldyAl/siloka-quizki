// src/pages/quiz/TakeQuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import quizService from '../../services/quizService';
import './TakeQuizPage.css';

const TakeQuizPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLimit, setTimeLimit] = useState(15 * 60); // Default 15 minutes
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        console.log("Fetching quiz with ID:", quizId);
        
        // First, get all quizzes to find the one with this ID
        const allQuizzes = await quizService.getQuizzes();
        console.log("Available quizzes:", allQuizzes);
        
        // Compare as string to avoid type issues
        const currentQuiz = allQuizzes.find(q => String(q.id) === String(quizId));
        console.log("Selected quiz:", currentQuiz);
        
        if (!currentQuiz) {
          throw new Error('Quiz not found');
        }
        
        setQuiz(currentQuiz);
        
        // Fetch all questions for this quiz
        const questionsData = [];
        for (let qId of currentQuiz.questions) {
          try {
            const questionData = await quizService.getQuestionById(qId);
            console.log("Raw question data:", questionData);
            
            // Transform the API response to match the expected format
            const transformedQuestion = {
              id: questionData.id,
              // Use question_text field from API, fallback to text if available
              text: questionData.question_text || questionData.text || '',
              // Transform choices to match expected format
              choices: questionData.choices.map(choice => ({
                id: choice.id,
                // Use choice_text field from API, fallback to text if available
                text: choice.choice_text || choice.text || '',
                is_correct: choice.is_correct
              }))
            };
            
            console.log("Transformed question:", transformedQuestion);
            questionsData.push(transformedQuestion);
          } catch (err) {
            console.error(`Error fetching question ${qId}:`, err);
          }
        }
        
        setQuestions(questionsData);
        
        // Set time limit based on quiz data
        if (currentQuiz.timeLimit) {
          setTimeLimit(currentQuiz.timeLimit * 60); // Convert minutes to seconds
          setTimeLeft(currentQuiz.timeLimit * 60);
        } else {
          // Default time: 2 minutes per question
          const calculatedTime = Math.max(10, questionsData.length * 2);
          setTimeLimit(calculatedTime * 60);
          setTimeLeft(calculatedTime * 60);
        }
        
        setStartTime(new Date());
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load quiz questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Set up timer after quiz data is loaded
  useEffect(() => {
    if (!timeLeft || loading) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const handleOptionSelect = (questionId, choiceId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitProgress(0);
    
    try {
      // Calculate time spent
      const endTime = new Date();
      const timeSpentMs = endTime - startTime;
      const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
      const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
      const timeSpent = `${String(timeSpentMinutes).padStart(2, '0')}:${String(timeSpentSeconds).padStart(2, '0')}`;
      
      // Submit answers to API
      const submittedAnswers = [];
      const totalAnswers = Object.keys(userAnswers).length;
      let completedAnswers = 0;
      
      for (const [questionId, choiceId] of Object.entries(userAnswers)) {
        try {
          console.log(`Submitting answer - Question: ${questionId}, Choice: ${choiceId}`);
          const response = await quizService.submitAnswer(
            Number(questionId),
            Number(choiceId)
          );
          console.log("Answer submission response:", response);
          submittedAnswers.push(response);
        } catch (err) {
          console.error(`Error submitting answer for question ${questionId}:`, err);
        }
        
        completedAnswers++;
        setSubmitProgress(Math.round((completedAnswers / totalAnswers) * 100));
      }
      
      // Add a small delay to ensure all answers are saved before fetching them
      console.log("Waiting for answers to be saved...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all submitted answers
      console.log("Fetching submitted answers");
      const answeredQuestions = await quizService.getUserAnswers();
      console.log("User answers from API:", answeredQuestions);
      
      // Process results
      const results = processResults(
        answeredQuestions, 
        questions, 
        userAnswers, 
        timeSpent,
        quiz
      );
      
      console.log("Final quiz results:", results);
      
      // Navigate to results page
      navigate(`/quizzes/${quizId}/results`, {
        state: { 
          results,
          refreshDashboard: true  // Add this to refresh dashboard when returning
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Process results from API responses - fixed version
  const processResults = (answeredQuestions, questions, userAnswers, timeSpent, quiz) => {
    console.log("Processing results with data:", {
      answeredQuestionsCount: answeredQuestions.length,
      questionsCount: questions.length,
      userAnswersCount: Object.keys(userAnswers).length
    });

    // Find answers for current quiz questions - with type-safe comparison
    const quizQuestionIds = questions.map(q => Number(q.id));
    const relevantAnswers = answeredQuestions.filter(a => 
      quizQuestionIds.includes(Number(a.question_id))
    );
    
    console.log("Relevant answers for this quiz:", relevantAnswers);
    
    // Count correct answers
    const correctAnswers = relevantAnswers.filter(answer => answer.is_correct === true);
    console.log("Correct answers:", correctAnswers);
    
    // Build results object
    return {
      quizId,
      quizTitle: quiz?.title || "Quiz",
      score: correctAnswers.length,
      totalQuestions: questions.length,
      timeSpent,
      passingScore: Math.ceil(questions.length * 0.6), // 60% passing score
      dateTaken: new Date().toISOString(),
      questions: questions.map(question => {
        // Convert IDs to numbers for consistent comparison
        const questionId = Number(question.id);
        const userChoiceId = userAnswers[question.id] ? Number(userAnswers[question.id]) : null;
        
        const userChoice = question.choices.find(
          choice => Number(choice.id) === userChoiceId
        );
        
        // Find the correct choice - first try local data
        let correctChoice = question.choices.find(choice => choice.is_correct === true);
        
        // If not found in local data, check API responses
        if (!correctChoice) {
          const correctAnswerData = relevantAnswers.find(a => 
            Number(a.question_id) === questionId && a.is_correct === true
          );
          
          if (correctAnswerData) {
            correctChoice = question.choices.find(c => 
              Number(c.id) === Number(correctAnswerData.choice_id)
            );
          }
        }
        
        // Find if this question was answered correctly
        const userAnswerIsCorrect = relevantAnswers.find(
          a => Number(a.question_id) === questionId && 
              Number(a.choice_id) === userChoiceId && 
              a.is_correct === true
        );
        
        console.log(`Question ${questionId} processing:`, {
          userChoiceId,
          correctChoiceId: correctChoice?.id,
          userAnswerIsCorrect: !!userAnswerIsCorrect
        });
        
        return {
          id: question.id,
          question: question.text,
          userAnswer: userChoice ? userChoice.text : "Not answered",
          correctAnswer: correctChoice ? correctChoice.text : "Unknown",
          isCorrect: !!userAnswerIsCorrect
        };
      })
    };
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="take-quiz-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="take-quiz-content loading">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p>Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="take-quiz-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="take-quiz-content">
          <div className="quiz-error">
            <h2>Houston, we have a problem</h2>
            <p>{error}</p>
            <Button 
              variant="secondary" 
              theme="space"
              onClick={() => navigate('/quizzes')}
            >
              Return to Quiz List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="take-quiz-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="take-quiz-content">
          <div className="quiz-error">
            <h2>No Questions Available</h2>
            <p>This quiz doesn't have any questions yet.</p>
            <Button 
              variant="secondary" 
              theme="space"
              onClick={() => navigate('/quizzes')}
            >
              Return to Quiz List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="take-quiz-container">
      {/* Star background */}
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>

      <div className="take-quiz-content">
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="question-counter">
              Question {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="quiz-timer">
            <div className="timer-icon">⏱️</div>
            <div className="timer-value">{formatTime(timeLeft)}</div>
          </div>
        </div>
        
        <div className="question-card">
          <div className="question-text">
            <h2>{currentQuestion.text}</h2>
          </div>
          
          <div className="answer-options">
            {currentQuestion.choices?.map(choice => (
              <div 
                key={choice.id}
                className={`answer-option ${userAnswers[currentQuestion.id] === choice.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(currentQuestion.id, choice.id)}
              >
                <div className="option-selector">
                  {userAnswers[currentQuestion.id] === choice.id ? (
                    <div className="option-selected"></div>
                  ) : null}
                </div>
                <div className="option-text">{choice.text}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="quiz-navigation">
          <Button
            variant="secondary"
            theme="space"
            disabled={currentQuestionIndex === 0}
            onClick={handlePrevQuestion}
          >
            Previous
          </Button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              theme="space"
              onClick={handleNextQuestion}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              theme="space"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
            >
              {isSubmitting ? `Submitting... ${submitProgress}%` : 'Submit Quiz'}
            </Button>
          )}
        </div>
        
        <div className="quiz-question-map">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`question-dot ${userAnswers[questions[index].id] ? 'answered' : ''} ${index === currentQuestionIndex ? 'current' : ''}`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        {isSubmitting && (
          <div className="submission-overlay">
            <div className="submission-progress">
              <div className="cosmic-loader">
                <div className="orbit-spinner">
                  <div className="orbit"></div>
                  <div className="planet"></div>
                </div>
                <p>Submitting your answers... {submitProgress}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;
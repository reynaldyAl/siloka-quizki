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
  const [timeLimit, setTimeLimit] = useState(15 * 60);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setIsResetting(true);
        console.log("Starting fresh quiz with ID:", quizId);
        
        // Use startFreshQuiz to reset previous answers AND quiz score
        const freshQuizResult = await quizService.startFreshQuiz(quizId);
        console.log("Fresh quiz result:", freshQuizResult);
        
        if (!freshQuizResult.success) {
          throw new Error('Failed to prepare quiz');
        }
        
        const currentQuiz = freshQuizResult.quiz;
        setQuiz(currentQuiz);
        setIsResetting(false);
        
        // Get question details
        const questionsData = [];
        const questionIds = currentQuiz.questions || [];
        
        for (let qId of questionIds) {
          try {
            const questionData = await quizService.getQuestionById(qId);
            console.log("Raw question data:", questionData);
            
            const transformedQuestion = {
              id: questionData.id,
              text: questionData.question_text || questionData.text || '',
              choices: questionData.choices.map(choice => ({
                id: choice.id,
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
        
        // Set time limit
        if (currentQuiz.timeLimit) {
          setTimeLimit(currentQuiz.timeLimit * 60);
          setTimeLeft(currentQuiz.timeLimit * 60);
        } else {
          const calculatedTime = Math.max(10, questionsData.length * 2);
          setTimeLimit(calculatedTime * 60);
          setTimeLeft(calculatedTime * 60);
        }
        
        setStartTime(new Date());
        
        // Show success message about reset
        if (freshQuizResult.resetResult.resetCount > 0 || freshQuizResult.scoreResetResult.success) {
          console.log(`✅ Reset ${freshQuizResult.resetResult.resetCount} answers and quiz score - starting fresh!`);
        } else {
          console.log("✅ Starting fresh quiz session!");
        }
        
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz. Please try again later.');
        setIsResetting(false);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft || loading) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
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
      const endTime = new Date();
      const timeSpentMs = endTime - startTime;
      const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
      const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);
      const timeSpent = `${String(timeSpentMinutes).padStart(2, '0')}:${String(timeSpentSeconds).padStart(2, '0')}`;
      
      const submittedAnswers = [];
      let totalScore = 0;
      let correctCount = 0;
      const totalQuestions = Object.keys(userAnswers).length;
      
      console.log(`🎯 SUBMITTING QUIZ: ${totalQuestions} answers to submit`);
      
      // Submit individual answers first
      for (const [questionId, choiceId] of Object.entries(userAnswers)) {
        if (!questionId || !choiceId) continue;
        
        try {
          console.log(`📝 Submitting answer: Q${questionId} -> Choice${choiceId}`);
          const response = await quizService.submitAnswer(
            Number(questionId),
            Number(choiceId)
          );
          
          // IMPROVED: Validate that is_correct is present in response
          if (response.is_correct === undefined) {
            console.warn(`⚠️ Backend didn't provide is_correct for question ${questionId}`);
          } else {
            console.log(`✅ Backend validation: Answer is ${response.is_correct ? 'CORRECT' : 'INCORRECT'}`);
          }
          
          submittedAnswers.push(response);
          totalScore += response.score || 0;
          
          // Only count as correct if is_correct is explicitly true
          if (response.is_correct === true) {
            correctCount++;
            console.log(`✓ Correct answer for question ${questionId}`);
          }
          
          console.log(`✅ Answer submitted: score=${response.score}, correct=${response.is_correct}`);
          
        } catch (err) {
          console.error(`❌ Error submitting answer for question ${questionId}:`, err);
          // Continue with other answers even if one fails
        }
        
        // Update progress
        const completedAnswers = submittedAnswers.length;
        setSubmitProgress(Math.round((completedAnswers / totalQuestions) * 50)); // 50% for individual answers
      }
      
      console.log(`📊 QUIZ SUMMARY: Total Score=${totalScore}, Correct=${correctCount}/${totalQuestions}`);
      
      // Submit quiz completion score to QuizScore table
      try {
        console.log(`📊 Submitting quiz score to database...`);
        const quizScoreResponse = await quizService.submitQuizScore(
          quiz.id,
          totalScore,
          totalQuestions,
          correctCount
        );
        console.log("✅ Quiz score submitted successfully:", quizScoreResponse);
        setSubmitProgress(100); // 100% after quiz score is submitted
      } catch (scoreError) {
        console.error("⚠️ Failed to submit quiz score:", scoreError);
        // Continue anyway - individual answers are still saved
        setSubmitProgress(75);
      }
      
      console.log("Waiting for answers to be processed...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Fetching submitted answers for verification");
      const answeredQuestions = await quizService.getUserAnswers();
      console.log("User answers from API:", answeredQuestions);
      
      const results = processResults(
        answeredQuestions, 
        questions, 
        userAnswers, 
        timeSpent,
        quiz,
        totalScore,
        correctCount
      );
      
      console.log("Final quiz results:", results);
      
      navigate(`/quizzes/${quizId}/results`, {
        state: { 
          results,
          refreshDashboard: true
        }
      });
    } catch (err) {
      console.error('💥 Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const processResults = (answeredQuestions, questions, userAnswers, timeSpent, quiz, totalScore, correctCount) => {
    console.log("Processing results with data:", {
      answeredQuestionsCount: answeredQuestions.length,
      questionsCount: questions.length,
      userAnswersCount: Object.keys(userAnswers).length,
      totalScore,
      correctCount
    });

    const quizQuestionIds = questions.map(q => Number(q.id));
    const relevantAnswers = answeredQuestions.filter(a => 
      quizQuestionIds.includes(Number(a.question_id))
    );
    
    console.log("Relevant answers for this quiz:", relevantAnswers);
    
    // Use the calculated values from submission instead of recalculating
    const finalCorrectCount = correctCount || relevantAnswers.filter(answer => answer.is_correct === true).length;
    const finalTotalScore = totalScore || relevantAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    
    console.log("Final calculations:", { finalCorrectCount, finalTotalScore });
    
    return {
      quizId,
      quizTitle: quiz?.title || "Quiz",
      score: finalCorrectCount,
      totalQuestions: questions.length,
      totalScore: finalTotalScore,
      timeSpent,
      passingScore: Math.ceil(questions.length * 0.6),
      dateTaken: new Date().toISOString(),
      questions: questions.map(question => {
        const questionId = Number(question.id);
        const userChoiceId = userAnswers[question.id] ? Number(userAnswers[question.id]) : null;
        
        const userChoice = question.choices.find(
          choice => Number(choice.id) === userChoiceId
        );
        
        let correctChoice = question.choices.find(choice => choice.is_correct === true);
        
        if (!correctChoice) {
          // If correct choice wasn't in the original data (non-admin user),
          // Try to find it from the submitted answers
          const correctAnswerData = relevantAnswers.find(a => 
            Number(a.question_id) === questionId && a.is_correct === true
          );
          
          if (correctAnswerData) {
            correctChoice = question.choices.find(c => 
              Number(c.id) === Number(correctAnswerData.choice_id)
            );
          }
        }
        
        // Get the actual answer submission from the backend results
        const userAnswer = relevantAnswers.find(
          a => Number(a.question_id) === questionId && 
              Number(a.choice_id) === userChoiceId
        );
        
        // Trust the backend's validation result
        const isCorrect = userAnswer?.is_correct === true;
        
        console.log(`Question ${questionId} processing:`, {
          userChoiceId,
          correctChoiceId: correctChoice?.id,
          userAnswerIsCorrect: isCorrect
        });
        
        return {
          id: question.id,
          question: question.text,
          userAnswer: userChoice ? userChoice.text : "Not answered",
          correctAnswer: correctChoice ? correctChoice.text : "Unknown",
          isCorrect: isCorrect
        };
      })
    };
  };

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
            <p>
              {isResetting 
                ? "🔄 Preparing fresh quiz session..." 
                : "📚 Loading quiz questions..."
              }
            </p>
            {isResetting && (
              <p style={{ fontSize: '0.9em', opacity: 0.8, marginTop: '10px' }}>
                Clearing previous answers and scores...
              </p>
            )}
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
            <h2>🚀 Houston, we have a problem</h2>
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
            <h2>📝 No Questions Available</h2>
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
                <p>
                  {submitProgress < 50 ? 'Submitting individual answers...' : 
                   submitProgress < 100 ? 'Recording quiz completion...' : 
                   'Processing results...'}
                  {submitProgress}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;
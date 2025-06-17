<<<<<<< HEAD
// contexts/QuizContext.jsx - Quiz state management
// contexts/QuizContext.jsx
import React, { createContext, useState } from 'react';
import quizService from '../services/quizService';

export const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions = await quizService.getAllQuestions();
      setCurrentQuiz(questions);
      setAnswers({});
      setResults(null);
      return questions;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch quiz questions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const submissions = Object.entries(answers).map(async ([questionId, choiceId]) => {
        return await quizService.submitAnswer(parseInt(questionId), parseInt(choiceId));
      });
      
      const results = await Promise.all(submissions);
      setResults(results);
      return results;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        answers,
        results,
        loading,
        error,
        startQuiz,
        saveAnswer,
        submitQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
=======
// contexts/QuizContext.jsx - Quiz state management
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

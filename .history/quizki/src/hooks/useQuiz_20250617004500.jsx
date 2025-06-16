<<<<<<< HEAD
// hooks/useQuiz.jsx - Custom hook for quiz functionality


// hooks/useQuiz.jsx
import { useContext } from 'react';
import { QuizContext } from '../contexts/QuizContext';

export const useQuiz = () => {
  const context = useContext(QuizContext);
  
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  
  return context;
};
=======
// hooks/useQuiz.jsx - Custom hook for quiz functionality
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

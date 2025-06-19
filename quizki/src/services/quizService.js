import api from './api';
//  ini adalah versi better dari yang sebelumnya
//  update : Dapat membaca Jawaban 1st try 
//  NEW: Added QuizScore support
// Need upgrade : Data saat re-take saat menjalankan local host dan db untuk kedua kali belum bisa (saat relogin)

// Add a cache for correct answers
const correctAnswersCache = {};

// Helper functions for quiz transformation
const groupQuestionsByCategory = (questions) => {
  const groups = {};
  questions.forEach(question => {
    // Use category or a default value if not present
    const category = question.category || 'General Knowledge';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(question);
  });
  return groups;
};

const calculateEstimatedTime = (questionCount) => {
  return Math.max(5, Math.ceil(questionCount * 1.5)); // 1.5 minutes per question
};

const determineDifficulty = (questions) => {
  if (questions.length === 0) return 'Beginner';
  
  const difficultyMap = { 'easy': 1, 'beginner': 1, 'medium': 2, 'intermediate': 2, 'hard': 3, 'advanced': 3 };
  let totalScore = 0;
  
  questions.forEach(question => {
    const difficultyLevel = question.difficulty ? question.difficulty.toLowerCase() : 'medium';
    totalScore += difficultyMap[difficultyLevel] || 2;
  });
  
  const averageScore = totalScore / questions.length;
  if (averageScore <= 1.5) return 'Beginner';
  if (averageScore <= 2.5) return 'Intermediate';
  return 'Advanced';
};

const transformQuestion = (questionData) => {
  // Find and cache the correct choice
  const correctChoice = (questionData.choices || []).find(c => c.is_correct === true);
  if (correctChoice) {
    correctAnswersCache[questionData.id] = {
      choiceId: correctChoice.id,
      text: correctChoice.choice_text || correctChoice.text || ''
    };
    console.log(`Cached correct answer for question ${questionData.id}:`, correctAnswersCache[questionData.id]);
  }
  
  // Create a standardized question object regardless of API format
  return {
    id: questionData.id,
    text: questionData.question_text || questionData.text || '',
    category: questionData.category || 'General Knowledge',
    difficulty: questionData.difficulty || 'Medium',
    choices: (questionData.choices || []).map(choice => ({
      id: choice.id,
      text: choice.choice_text || choice.text || '',
      is_correct: choice.is_correct
    }))
  };
};

// Mock data for development when API is not available
const mockQuestions = [
  {
    id: 1,
    text: "What is the capital of France?",
    category: "Geography",
    difficulty: "easy",
    choices: [
      { id: 1, text: "London", is_correct: false },
      { id: 2, text: "Berlin", is_correct: false },
      { id: 3, text: "Paris", is_correct: true },
      { id: 4, text: "Rome", is_correct: false }
    ]
  },
  {
    id: 2,
    text: "Who wrote 'Romeo and Juliet'?",
    category: "Literature",
    difficulty: "medium",
    choices: [
      { id: 5, text: "Charles Dickens", is_correct: false },
      { id: 6, text: "William Shakespeare", is_correct: true },
      { id: 7, text: "Jane Austen", is_correct: false },
      { id: 8, text: "Mark Twain", is_correct: false }
    ]
  },
  {
    id: 3,
    text: "In what year did World War II end?",
    category: "History",
    difficulty: "medium",
    choices: [
      { id: 9, text: "1943", is_correct: false },
      { id: 10, text: "1945", is_correct: true },
      { id: 11, text: "1947", is_correct: false },
      { id: 12, text: "1950", is_correct: false }
    ]
  },
  {
    id: 4,
    text: "What is the chemical symbol for gold?",
    category: "Science",
    difficulty: "easy",
    choices: [
      { id: 13, text: "Go", is_correct: false },
      { id: 14, text: "Gd", is_correct: false },
      { id: 15, text: "Au", is_correct: true },
      { id: 16, text: "Ag", is_correct: false }
    ]
  },
  {
    id: 5,
    text: "Which planet is known as the Red Planet?",
    category: "Astronomy",
    difficulty: "easy",
    choices: [
      { id: 17, text: "Venus", is_correct: false },
      { id: 18, text: "Jupiter", is_correct: false },
      { id: 19, text: "Mars", is_correct: true },
      { id: 20, text: "Saturn", is_correct: false }
    ]
  }
];

const mockAnswers = [
  {
    id: 101,
    question_id: 1,
    choice_id: 3,
    is_correct: true,
    created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: 102,
    question_id: 2,
    choice_id: 6, 
    is_correct: true,
    created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  }
];

const quizService = {
  // Get cached correct answer by question ID
  getCorrectAnswer: (questionId) => {
    return correctAnswersCache[questionId] || null;
  },
  
  // Get all cached correct answers
  getAllCachedAnswers: () => {
    return {...correctAnswersCache};
  },
  
  getAllQuestions: async (params = {}) => {
    try {
      console.log("Fetching all questions with params:", params);
      const response = await api.get('/questions', { params });
      console.log("Questions received:", response.data);
      
      // Cache correct answers for all questions
      (response.data || []).forEach(question => transformQuestion(question));
      
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock questions data for development");
        // Cache the mock answers too
        mockQuestions.forEach(question => transformQuestion(question));
        return mockQuestions;
      }
      
      return [];
    }
  },

  getQuestionById: async (questionId) => {
    try {
      // Ensure questionId is a valid number
      const id = parseInt(questionId, 10);
      if (isNaN(id)) {
        throw new Error(`Invalid question ID: ${questionId}`);
      }
      
      console.log(`Fetching question with ID: ${id}`);
      const response = await api.get(`/questions/${id}`);
      console.log(`Question ${id} data:`, response.data);
      
      // Transform the question to ensure consistent format and cache correct answer
      return transformQuestion(response.data);
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using mock data for question ${questionId}`);
        const mockQuestion = mockQuestions.find(q => q.id === Number(questionId));
        if (mockQuestion) {
          return transformQuestion(mockQuestion);
        }
      }
      
      throw error;
    }
  },

  submitAnswer: async (questionId, choiceId) => {
    try {
      console.log(`🔍 SUBMIT_ANSWER: Starting - Question ID: ${questionId}, Choice ID: ${choiceId}`);
      
      // Ensure IDs are numbers
      const parsedQuestionId = parseInt(questionId, 10);
      const parsedChoiceId = parseInt(choiceId, 10);
      
      if (isNaN(parsedQuestionId) || isNaN(parsedChoiceId)) {
        throw new Error(`Invalid IDs: question_id=${questionId}, choice_id=${choiceId}`);
      }
      
      // Create payload object
      const payload = {
        question_id: parsedQuestionId,
        choice_id: parsedChoiceId
      };
      
      console.log("📤 SUBMIT_ANSWER: Payload being sent:", payload);
      
      const response = await api.post('/answers', payload);
      
      // LOG THE FULL RESPONSE
      console.log("📥 SUBMIT_ANSWER: Full response:", response);
      console.log("📥 SUBMIT_ANSWER: Response data:", response.data);
      console.log("📥 SUBMIT_ANSWER: Response status:", response.status);
      
      // Check if the response has the correct IDs
      if (response.data.question_id !== parsedQuestionId) {
        console.error("❌ SUBMIT_ANSWER: Question ID mismatch!", {
          sent: parsedQuestionId,
          received: response.data.question_id
        });
      }
      
      if (response.data.choice_id !== parsedChoiceId) {
        console.error("❌ SUBMIT_ANSWER: Choice ID mismatch!", {
          sent: parsedChoiceId,
          received: response.data.choice_id
        });
      }
      
      // If response doesn't include is_correct, check our cache to enhance the response
      if (response.data && response.data.is_correct === undefined) {
        const cachedAnswer = correctAnswersCache[parsedQuestionId];
        if (cachedAnswer) {
          response.data.is_correct = (Number(cachedAnswer.choiceId) === Number(parsedChoiceId));
          console.log(`✅ SUBMIT_ANSWER: Adding is_correct from cache: ${response.data.is_correct}`);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("💥 SUBMIT_ANSWER: Error occurred:", error);
      console.error("💥 SUBMIT_ANSWER: Error response:", error.response?.data);
      
      // Try alternative format as fallback if the API expects different field names
      if (error.response?.status === 400) {
        try {
          console.log("Attempting alternative answer submission format...");
          const alternativePayload = {
            questionId: parseInt(questionId, 10),
            choiceId: parseInt(choiceId, 10)
          };
          
          const response = await api.post('/answers', alternativePayload);
          console.log("Alternative submission successful:", response.data);
          return response.data;
        } catch (fallbackError) {
          console.error("Alternative submission also failed:", fallbackError.response?.data);
        }
      }
      
      // In development mode, return mock answer
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock answer submission response");
        const mockQuestion = mockQuestions.find(q => q.id === Number(questionId));
        const mockChoice = mockQuestion?.choices.find(c => c.id === Number(choiceId));
        const is_correct = mockChoice?.is_correct || false;
        
        return {
          id: Math.floor(Math.random() * 1000) + 200,
          question_id: questionId,
          choice_id: choiceId,
          is_correct,
          created_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  },

  getUserAnswers: async () => {
    try {
      console.log("Fetching user answers");
      const response = await api.get('/my-answers');
      console.log("User answers received:", response.data);
      
      // Enhance the answers with correct answer info from cache
      const enhancedAnswers = (response.data || []).map(answer => {
        const questionId = answer.question_id;
        const cached = correctAnswersCache[questionId];
        
        // If we have cached correct answer and this field is missing
        if (cached && answer.is_correct === undefined) {
          answer.is_correct = (Number(cached.choiceId) === Number(answer.choice_id));
          console.log(`Enhanced answer for question ${questionId} with is_correct=${answer.is_correct}`);
        }
        
        return answer;
      });
      
      return enhancedAnswers;
    } catch (error) {
      console.error("Error fetching user answers:", error.response?.data || error.message);
      
      // If in development mode, return mock answers
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock user answers");
        return mockAnswers;
      }
      
      // If the API fails, return an empty array as fallback for the quiz to still work
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log("Returning empty answers array as fallback");
        return [];
      }
      
      throw error;
    }
  },
  
  // NEW: Reset all answers for specific questions
  resetQuizAnswers: async (questionIds) => {
    try {
      console.log("Raw questionIds received:", questionIds);
      
      // Ensure questionIds is an array and all elements are numbers
      let validQuestionIds = [];
      
      if (Array.isArray(questionIds)) {
        validQuestionIds = questionIds.map(qId => {
          // Handle different possible structures
          let id;
          if (typeof qId === 'object' && qId !== null) {
            id = parseInt(qId.id, 10);
          } else {
            id = parseInt(qId, 10);
          }
          
          if (isNaN(id)) {
            console.warn(`Invalid question ID found: ${qId} (type: ${typeof qId})`);
            return null;
          }
          return id;
        }).filter(id => id !== null);
      } else {
        throw new Error('questionIds must be an array');
      }
      
      console.log("Valid question IDs:", validQuestionIds);
      
      if (validQuestionIds.length === 0) {
        return {
          success: true,
          totalQuestions: 0,
          resetCount: 0,
          results: [],
          message: 'No valid question IDs to reset'
        };
      }
      
      const resetPromises = validQuestionIds.map(async (questionId) => {
        try {
          console.log(`Resetting answer for question ${questionId}`);
          const response = await api.delete(`/my-answers/${questionId}`);
          console.log(`Reset answer for question ${questionId}:`, response.data);
          return { questionId, success: true };
        } catch (error) {
          // 404 means no answer exists, which is fine
          if (error.response?.status === 404) {
            console.log(`No existing answer for question ${questionId} - OK`);
            return { questionId, success: true, message: 'No existing answer' };
          }
          console.error(`Failed to reset answer for question ${questionId}:`, error);
          return { questionId, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(resetPromises);
      console.log("Reset results:", results);
      
      const successCount = results.filter(r => r.success).length;
      console.log(`Successfully reset ${successCount}/${validQuestionIds.length} questions`);
      
      return {
        success: true,
        totalQuestions: validQuestionIds.length,
        resetCount: successCount,
        results
      };
    } catch (error) {
      console.error("Error resetting quiz answers:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // NEW: Quiz Score Management
  submitQuizScore: async (quizId, score, totalQuestions, correctAnswers) => {
    try {
      console.log(`📊 SUBMIT_QUIZ_SCORE: Quiz ${quizId} - Score: ${score}, Correct: ${correctAnswers}/${totalQuestions}`);
      
      const payload = {
        quiz_id: parseInt(quizId, 10),
        score: parseFloat(score),
        total_questions: parseInt(totalQuestions, 10),
        correct_answers: parseInt(correctAnswers, 10)
      };
      
      console.log("📤 Quiz score payload:", payload);
      
      const response = await api.post('/quiz-scores', payload);
      console.log("✅ Quiz score submitted:", response.data);
      return response.data;
    } catch (error) {
      console.error("💥 Error submitting quiz score:", error.response?.data || error.message);
      throw error;
    }
  },

  getMyQuizScores: async () => {
    try {
      console.log("🔍 Fetching user quiz scores");
      const response = await api.get('/my-quiz-scores');
      console.log("📊 Quiz scores received:", response.data);
      return response.data;
    } catch (error) {
      console.error("💥 Error fetching quiz scores:", error.response?.data || error.message);
      return [];
    }
  },

  getMyQuizScore: async (quizId) => {
    try {
      console.log(`🔍 Fetching score for quiz ${quizId}`);
      const response = await api.get(`/my-quiz-score/${quizId}`);
      console.log("📊 Quiz score received:", response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`📭 No score found for quiz ${quizId}`);
        return null;
      }
      console.error("💥 Error fetching quiz score:", error.response?.data || error.message);
      throw error;
    }
  },

  resetQuizScore: async (quizId) => {
    try {
      console.log(`🔄 Resetting score for quiz ${quizId}`);
      const response = await api.delete(`/my-quiz-score/${quizId}`);
      console.log("✅ Quiz score reset:", response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`📭 No score to reset for quiz ${quizId}`);
        return { success: true, message: 'No existing score to reset' };
      }
      console.error("💥 Error resetting quiz score:", error.response?.data || error.message);
      throw error;
    }
  },

  // NEW: Start fresh quiz (reset + prepare) - UPDATED to include quiz score reset
  startFreshQuiz: async (quizId) => {
    try {
      // Ensure quizId is a number
      const id = parseInt(quizId, 10);
      if (isNaN(id)) {
        throw new Error(`Invalid quiz ID: ${quizId}`);
      }
      
      console.log(`🔄 Starting fresh quiz ${id}`);
      
      // Get quiz details
      const quiz = await quizService.getQuizById(id);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      console.log("Quiz data received:", quiz);
      
      // Extract question IDs - handle different possible structures
      let questionIds = [];
      
      if (quiz.questions && Array.isArray(quiz.questions)) {
        // If quiz.questions is an array of objects or IDs
        questionIds = quiz.questions.map(q => {
          if (typeof q === 'object' && q !== null) {
            return parseInt(q.id, 10);
          } else {
            return parseInt(q, 10);
          }
        }).filter(id => !isNaN(id));
      } else if (quiz.questionDetails && Array.isArray(quiz.questionDetails)) {
        // If question details are provided
        questionIds = quiz.questionDetails.map(q => parseInt(q.id, 10)).filter(id => !isNaN(id));
      } else {
        console.warn("No questions found in quiz:", quiz);
      }
      
      console.log("Extracted question IDs:", questionIds);
      
      if (questionIds.length === 0) {
        console.warn('No valid question IDs found in quiz');
        return {
          success: true,
          quiz,
          resetResult: {
            success: true,
            totalQuestions: 0,
            resetCount: 0,
            results: []
          },
          scoreResetResult: { success: true, message: 'No score to reset' },
          message: 'Quiz has no questions to reset'
        };
      }
      
      // Reset both individual answers AND quiz score in parallel
      const [resetResult, scoreResetResult] = await Promise.all([
        quizService.resetQuizAnswers(questionIds),
        quizService.resetQuizScore(id)
      ]);
      
      console.log("Quiz answers reset result:", resetResult);
      console.log("Quiz score reset result:", scoreResetResult);
      
      return {
        success: true,
        quiz,
        resetResult,
        scoreResetResult,
        message: `Quiz prepared: ${resetResult.resetCount} answers cleared, score reset`
      };
    } catch (error) {
      console.error("Error starting fresh quiz:", error);
      throw error;
    }
  },
  
  // Updated method to get quizzes from API first
  getQuizzes: async () => {
    try {
      console.log("Fetching quizzes from API");
      // Try to fetch quizzes directly from API first
      const response = await api.get('/quizzes');
      
      // Check if we got data back
      if (response.data && response.data.length > 0) {
        console.log("Quizzes received from API:", response.data);
        
        // Process the quizzes to ensure they have the expected format
        const processedQuizzes = response.data.map(quiz => ({
          ...quiz,
          // Ensure we have questionCount if not provided
          questionCount: quiz.questionCount || (quiz.questions?.length || 0),
          // Ensure we have difficulty if not provided
          difficulty: quiz.difficulty || 'Medium',
          // Ensure we have timeLimit if not provided
          timeLimit: quiz.time_limit || quiz.timeLimit || calculateEstimatedTime(quiz.questions?.length || 0)
        }));
        
        return processedQuizzes;
      }
      
      // Fallback: If no quizzes from API, create them from questions as before
      console.log("No quizzes from API, transforming from questions");
      const questions = await quizService.getAllQuestions();
      const questionGroups = groupQuestionsByCategory(questions);
      
      // Transform question groups into quiz format
      const quizzes = Object.entries(questionGroups).map(([category, questions], index) => {
        return {
          id: `quiz-${index + 1}`,
          title: `${category} Quiz`,
          description: `Test your knowledge on ${category.toLowerCase()} topics`,
          questionCount: questions.length,
          timeLimit: calculateEstimatedTime(questions.length),
          difficulty: determineDifficulty(questions),
          category,
          questions: questions.map(q => q.id) // Store question IDs for later use
        };
      });
      
      console.log("Transformed quizzes:", quizzes);
      return quizzes;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      
      // In development mode, return mock quizzes based on mock questions
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock quizzes based on categories");
        
        const mockQuestionGroups = groupQuestionsByCategory(mockQuestions);
        const mockQuizzes = Object.entries(mockQuestionGroups).map(([category, questions], index) => {
          return {
            id: `quiz-${index + 1}`,
            title: `${category} Quiz`,
            description: `Test your knowledge on ${category.toLowerCase()} topics`,
            questionCount: questions.length,
            timeLimit: calculateEstimatedTime(questions.length),
            difficulty: determineDifficulty(questions),
            category,
            questions: questions.map(q => q.id)
          };
        });
        
        console.log("Generated mock quizzes:", mockQuizzes);
        return mockQuizzes;
      }
      
      throw error;
    }
  },
  
  // Updated method to get a specific quiz by ID from API first
  getQuizById: async (quizId) => {
    try {
      // Ensure quizId is a number
      const id = parseInt(quizId, 10);
      if (isNaN(id)) {
        throw new Error(`Invalid quiz ID: ${quizId}`);
      }
      
      console.log(`Fetching quiz with ID: ${id}`);
      
      // Try to fetch directly from API first
      try {
        const response = await api.get(`/quizzes/${id}`);
        if (response.data) {
          console.log("Quiz found in API:", response.data);
          
          // Handle different possible structures for questions
          let questionIds = [];
          if (response.data.questions && Array.isArray(response.data.questions)) {
            questionIds = response.data.questions.map(q => {
              if (typeof q === 'object' && q !== null) {
                return parseInt(q.id, 10);
              } else {
                return parseInt(q, 10);
              }
            }).filter(qId => !isNaN(qId));
          }
          
          console.log("Question IDs from API quiz:", questionIds);
          
          // Fetch question details if we have IDs
          let questionDetails = [];
          if (questionIds.length > 0) {
            const questionPromises = questionIds.map(qid => quizService.getQuestionById(qid));
            questionDetails = await Promise.all(questionPromises);
          }
          
          return {
            ...response.data,
            questions: questionIds, // Keep as IDs for compatibility
            questionDetails // Full question objects
          };
        }
      } catch (apiError) {
        console.log("Could not find quiz in API, falling back to transformed quizzes");
      }
      
      // Fallback to transformed quizzes
      const allQuizzes = await quizService.getQuizzes();
      const quiz = allQuizzes.find(q => String(q.id) === String(id));
      
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      
      console.log("Found quiz:", quiz);
      
      // Fetch all the questions for this quiz
      const questionPromises = quiz.questions.map(qid => quizService.getQuestionById(qid));
      const questionDetails = await Promise.all(questionPromises);
      
      const enhancedQuiz = {
        ...quiz,
        questionDetails
      };
      
      console.log("Enhanced quiz with questions:", enhancedQuiz);
      return enhancedQuiz;
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      throw error;
    }
  },
  
  // Add new createQuiz method using direct API call
  createQuiz: async (quizData) => {
    try {
      console.log("Creating quiz with data:", quizData);
      
      // Use the same direct approach that works for questions
      const response = await api.post('/quizzes', quizData);
      
      console.log("Quiz created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to create quizzes.");
      }
      
      throw error;
    }
  },

  // Update quiz
  updateQuiz: async (quizId, quizData) => {
    try {
      const id = parseInt(quizId, 10);
      if (isNaN(id)) {
        throw new Error(`Invalid quiz ID: ${quizId}`);
      }
      
      console.log(`Updating quiz ${id} with data:`, quizData);
      const response = await api.put(`/quizzes/${id}`, quizData);
      console.log("Quiz updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating quiz:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete quiz
  deleteQuiz: async (quizId) => {
    try {
      const id = parseInt(quizId, 10);
      if (isNaN(id)) {
        throw new Error(`Invalid quiz ID: ${quizId}`);
      }
      
      console.log(`Deleting quiz ${id}`);
      const response = await api.delete(`/quizzes/${id}`);
      console.log("Quiz deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting quiz:", error.response?.data || error.message);
      throw error;
    }
  },

  // Add debugging function for database inspection
  debugDatabaseAnswers: async () => {
    try {
      console.log("🔍 DEBUG: Checking all user answers");
      const response = await api.get('/my-answers');
      
      console.log("📊 DEBUG: Raw database response:", response.data);
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((answer, index) => {
          console.log(`📝 DEBUG Answer ${index + 1}:`, {
            id: answer.id,
            user_id: answer.user_id,
            question_id: answer.question_id,
            choice_id: answer.choice_id,
            score: answer.score,
            created_at: answer.created_at
          });
        });
      } else {
        console.log("📭 DEBUG: No answers found");
      }
    } catch (error) {
      console.error("💥 DEBUG: Error fetching answers:", error);
    }
  },
  
  // Mock submission for testing when the real API fails
  mockSubmitAnswer: async (questionId, choiceId) => {
    console.log("Using mock answer submission");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if we have the correct answer cached for more realistic results
    const cached = correctAnswersCache[questionId];
    const is_correct = cached 
      ? Number(cached.choiceId) === Number(choiceId)
      : Math.random() > 0.5; // Random if we don't know
    
    return {
      id: Math.floor(Math.random() * 1000),
      question_id: questionId,
      choice_id: choiceId,
      is_correct,
      created_at: new Date().toISOString()
    };
  }
};

export default quizService;
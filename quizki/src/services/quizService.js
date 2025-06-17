// services/quizService.js
import api from './api';

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

  getQuestionById: async (id) => {
    try {
      console.log("Fetching question with ID:", id);
      const response = await api.get(`/questions/${id}`);
      console.log(`Question ${id} data:`, response.data);
      
      // Transform the question to ensure consistent format and cache correct answer
      return transformQuestion(response.data);
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error.response?.data || error.message);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using mock data for question ${id}`);
        const mockQuestion = mockQuestions.find(q => q.id === Number(id));
        if (mockQuestion) {
          return transformQuestion(mockQuestion);
        }
      }
      
      throw error;
    }
  },

  submitAnswer: async (questionId, choiceId) => {
    try {
      console.log(`Submitting answer - Question ID: ${questionId}, Choice ID: ${choiceId}`);
      
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
      
      console.log("Answer submission payload:", payload);
      
      const response = await api.post('/answers', payload);
      console.log("Answer submission response:", response.data);
      
      // If response doesn't include is_correct, check our cache to enhance the response
      if (response.data && response.data.is_correct === undefined) {
        const cachedAnswer = correctAnswersCache[parsedQuestionId];
        if (cachedAnswer) {
          response.data.is_correct = (Number(cachedAnswer.choiceId) === Number(parsedChoiceId));
          console.log(`Adding is_correct from cache: ${response.data.is_correct}`);
        }
      }
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      console.error("API Error in submitAnswer:", errorData || error.message);
      console.error("Request data that caused error:", {
        question_id: questionId,
        choice_id: choiceId
      });
      
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
  
  // New method to get transformed quizzes
  getQuizzes: async () => {
    try {
      console.log("Fetching and transforming quizzes");
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
      console.error("Error transforming questions to quizzes:", error);
      
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
  
  // Get a specific quiz by ID
  getQuizById: async (quizId) => {
    try {
      console.log("Fetching quiz with ID:", quizId);
      
      // First get all quizzes
      const allQuizzes = await quizService.getQuizzes();
      const quiz = allQuizzes.find(q => String(q.id) === String(quizId));
      
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
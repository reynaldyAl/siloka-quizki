<<<<<<< HEAD
// services/quizService.js - Quiz related API services
// services/quizService.js
import api from './api';

const quizService = {
  getAllQuestions: async (params = {}) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  submitAnswer: async (questionId, choiceId) => {
    const response = await api.post('/answers', {
      question_id: questionId,
      choice_id: choiceId
    });
    return response.data;
  },

  getUserAnswers: async () => {
    const response = await api.get('/my-answers');
    return response.data;
  }
};

export default quizService;
=======
// services/quizService.js - Quiz related API services
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

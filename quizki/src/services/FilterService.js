// src/services/FilterService.js
export const filterUsers = (users, filters) => {
  if (!filters) return users;
  
  return users.filter(user => {
    // Search filter
    if (filters.search && !(
      user.username?.toLowerCase().includes(filters.search) || 
      user.email?.toLowerCase().includes(filters.search)
    )) {
      return false;
    }
    
    // Role filter
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    
    // Status filter
    if (filters.status) {
      const isActive = user.is_active !== false; // consider undefined as active
      if (filters.status === 'active' && !isActive) return false;
      if (filters.status === 'inactive' && isActive) return false;
    }
    
    return true;
  });
};

export const filterQuestions = (questions, filters) => {
  if (!filters) return questions;
  
  return questions.filter(question => {
    // Search filter
    if (filters.search && !(
      question.text?.toLowerCase().includes(filters.search)
    )) {
      return false;
    }
    
    // Difficulty filter
    if (filters.difficulty && question.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Category filter
    if (filters.category && question.category !== filters.category) {
      return false;
    }
    
    return true;
  });
};

export const extractQuestionCategories = (questions) => {
  const categoriesSet = new Set();
  
  questions.forEach(question => {
    if (question.category) {
      categoriesSet.add(question.category);
    }
  });
  
  return Array.from(categoriesSet);
};
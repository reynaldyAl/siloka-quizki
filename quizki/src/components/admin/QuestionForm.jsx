// components/admin/QuestionForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const QuestionForm = ({ onSubmit, loading, initialData }) => {
  const [categories, setCategories] = useState(['Geography', 'History', 'Science', 'Literature', 'Arts', 'Sports', 'Technology']);
  const [difficulties, setDifficulties] = useState(['easy', 'medium', 'hard']);
  
  const [formData, setFormData] = useState({
    question_text: initialData?.question_text || '',
    category: initialData?.category || 'Science',
    difficulty: initialData?.difficulty || 'medium',
    score: initialData?.score || 10,
    choices: initialData?.choices || [
      { choice_text: '', is_correct: true },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false },
      { choice_text: '', is_correct: false }
    ]
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleChoiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChoices = [...formData.choices];
    
    if (name === 'is_correct') {
      // If marking this choice as correct, mark all others as incorrect
      updatedChoices.forEach((choice, i) => {
        choice.is_correct = i === index;
      });
    } else {
      updatedChoices[index] = {
        ...updatedChoices[index],
        [name]: value
      };
    }
    
    setFormData(prev => ({
      ...prev,
      choices: updatedChoices
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.question_text.trim()) {
      errors.question_text = 'Question text is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.difficulty) {
      errors.difficulty = 'Difficulty is required';
    }
    
    if (formData.score < 1) {
      errors.score = 'Score must be at least 1';
    }
    
    // Validate that at least 2 choices are provided
    const nonEmptyChoices = formData.choices.filter(c => c.choice_text.trim());
    if (nonEmptyChoices.length < 2) {
      errors.choices = 'At least 2 answer choices are required';
    }
    
    // Validate that one choice is marked as correct
    const hasCorrect = formData.choices.some(c => c.is_correct && c.choice_text.trim());
    if (!hasCorrect) {
      errors.correctAnswer = 'One answer must be marked as correct';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty choices
      const formattedData = {
        ...formData,
        choices: formData.choices.filter(choice => choice.choice_text.trim())
      };
      
      onSubmit(formattedData);
    } else {
      console.log('Form has errors:', formErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Question Text */}
      <div className="mb-6">
        <label htmlFor="question_text" className="block text-white font-medium mb-2">
          Question Text
        </label>
        <textarea
          id="question_text"
          name="question_text"
          value={formData.question_text}
          onChange={handleChange}
          rows="3"
          className={`w-full bg-gray-700 border ${formErrors.question_text ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter your question here..."
          disabled={loading}
        ></textarea>
        {formErrors.question_text && (
          <p className="mt-1 text-sm text-red-400">{formErrors.question_text}</p>
        )}
      </div>
      
      {/* Category and Difficulty (Side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="category" className="block text-white font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-white font-medium mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Points/Score */}
      <div className="mb-6">
        <label htmlFor="score" className="block text-white font-medium mb-2">
          Points
        </label>
        <input
          type="number"
          id="score"
          name="score"
          value={formData.score}
          onChange={handleChange}
          min="1"
          max="100"
          className={`w-full md:w-1/4 bg-gray-700 border ${formErrors.score ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={loading}
        />
        {formErrors.score && (
          <p className="mt-1 text-sm text-red-400">{formErrors.score}</p>
        )}
      </div>
      
      {/* Answer Choices */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          Answer Choices
        </label>
        {formErrors.choices && (
          <p className="mt-1 mb-2 text-sm text-red-400">{formErrors.choices}</p>
        )}
        {formErrors.correctAnswer && (
          <p className="mt-1 mb-2 text-sm text-red-400">{formErrors.correctAnswer}</p>
        )}
        
        {formData.choices.map((choice, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="radio"
              name="correct_answer"
              checked={choice.is_correct}
              onChange={(e) => handleChoiceChange(index, { target: { name: 'is_correct', value: true }})}
              className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-700"
              disabled={loading}
            />
            <input
              type="text"
              name="choice_text"
              value={choice.choice_text}
              onChange={(e) => handleChoiceChange(index, e)}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Answer option ${index + 1}`}
              disabled={loading}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
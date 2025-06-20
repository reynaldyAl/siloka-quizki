// src/pages/quiz/QuizListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import './QuizListPage.css';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    // Fetch quizzes and user progress
    const fetchData = async () => {
      setLoading(true);
      try {
        const quizData = await quizService.getQuizzes();
        setQuizzes(quizData);
        
        // Try to fetch user's quiz progress if they're logged in
        try {
          const progressData = await quizService.getMyQuizScores();
          
          // Transform into a lookup object for easy access
          const progressMap = {};
          progressData.forEach(item => {
            progressMap[item.quiz_id] = {
              completed: true,
              completedAt: new Date(item.completed_at || new Date())
            };
          });
          
          setUserProgress(progressMap);
        } catch (progressErr) {
          console.log('Not logged in or no progress data');
        }
        
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Extract all available categories
  const categories = useMemo(() => {
    const allCategories = new Set(quizzes.map(quiz => quiz.category).filter(Boolean));
    return ['all', ...allCategories];
  }, [quizzes]);
  
  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(quiz => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Category filter
        const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
        
        // Difficulty filter
        const matchesDifficulty = selectedDifficulty === 'all' || 
          quiz.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
        
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        // Sort options
        switch(sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'oldest':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          case 'difficulty-asc':
            const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
            return difficultyOrder[a.difficulty.toLowerCase()] - difficultyOrder[b.difficulty.toLowerCase()];
          case 'difficulty-desc':
            const difficultyOrderDesc = { 'easy': 1, 'medium': 2, 'hard': 3 };
            return difficultyOrderDesc[b.difficulty.toLowerCase()] - difficultyOrderDesc[a.difficulty.toLowerCase()];
          default:
            return 0;
        }
      });
  }, [quizzes, searchQuery, selectedCategory, selectedDifficulty, sortBy]);
  
  // Get difficulty class for text coloring
  const getDifficultyClass = (difficulty) => {
    const lowerDiff = difficulty.toLowerCase();
    
    if (lowerDiff === 'easy' || lowerDiff === 'beginner') {
      return 'difficulty-beginner';
    } else if (lowerDiff === 'medium' || lowerDiff === 'intermediate') {
      return 'difficulty-intermediate';
    } else {
      return 'difficulty-advanced';
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSortBy('newest');
  };
  
  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-list-content">
          <div className="cosmic-loader">
            <div className="orbit-spinner">
              <div className="orbit"></div>
              <div className="planet"></div>
            </div>
            <p>Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-list-container">
        <div className="stars-bg small"></div>
        <div className="stars-bg medium"></div>
        <div className="quiz-list-content">
          <div className="quiz-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600/30 hover:bg-red-500/30 px-4 py-2 rounded-lg border border-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="stars-bg small"></div>
      <div className="stars-bg medium"></div>
      <div className="stars-bg large"></div>
      
      <div className="quiz-list-content">
        <h1>Available Quizzes</h1>
        <p className="quiz-list-subtitle">Test your knowledge with these cosmic challenges</p>
        
        {/* Filters */}
        <div className="quiz-filters">
          <div className="quiz-filters-row">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          
            <div className="filters-wrapper">
              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {/* Difficulty filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              
              {/* Sort option */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
                <option value="difficulty-asc">Easiest First</option>
                <option value="difficulty-desc">Hardest First</option>
              </select>
            </div>
          </div>
          
          {/* Filter summary */}
          {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || sortBy !== 'newest') && (
            <div className="filter-summary">
              <div>
                <span>Showing: </span>
                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
                {selectedCategory !== 'all' && <span className="filter-tag">Category: {selectedCategory}</span>}
                {selectedDifficulty !== 'all' && <span className="filter-tag">Difficulty: {selectedDifficulty}</span>}
                {searchQuery && <span className="filter-tag">Search: "{searchQuery}"</span>}
              </div>
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Quiz Grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="quiz-grid">
            {filteredQuizzes.map((quiz, index) => {
              const hasCompleted = userProgress[quiz.id]?.completed;
              
              return (
                <div 
                  key={quiz.id} 
                  className={`quiz-card ${hasCompleted ? 'completed' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {hasCompleted && (
                    <div className="completed-badge" title={`Completed on ${userProgress[quiz.id].completedAt.toLocaleDateString()}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="quiz-card-header">
                    <h2 className="quiz-card-title">{quiz.title}</h2>
                    {quiz.category && (
                      <span className="quiz-category-tag">{quiz.category}</span>
                    )}
                  </div>
                  
                  <p className="quiz-card-description">{quiz.description}</p>
                  
                  <div className="quiz-card-meta">
                    <div className="quiz-card-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>{quiz.questionCount || 0} Questions</span>
                    </div>
                    
                    {quiz.timeLimit && (
                      <div className="quiz-card-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{quiz.timeLimit} minutes</span>
                      </div>
                    )}
                    
                    <div className="quiz-card-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className={getDifficultyClass(quiz.difficulty)}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="quiz-card-action">
                    <Link to={`/quizzes/${quiz.id}`} className="view-quiz-btn">
                      {hasCompleted ? 'Retake Quiz' : 'Start Quiz'}
                    </Link>
                    {!hasCompleted && quiz.previewAvailable && (
                      <Link to={`/quizzes/${quiz.id}/preview`} className="preview-quiz-btn">
                        Preview
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No quizzes match your filters</p>
            <p className="empty-subtext">Try adjusting your search criteria</p>
            <button 
              onClick={clearFilters}
              className="clear-empty-btn"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
// src/components/dashboard/filters/QuestionFilter.js
import React, { useState } from 'react';

const QuestionFilter = ({ onFilterChange, categories }) => {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');

  const handleFilterChange = () => {
    onFilterChange({
      search: search.toLowerCase(),
      difficulty: difficulty !== 'all' ? difficulty : null,
      category: category !== 'all' ? category : null
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setTimeout(() => {
      onFilterChange({
        search: e.target.value.toLowerCase(),
        difficulty: difficulty !== 'all' ? difficulty : null,
        category: category !== 'all' ? category : null
      });
    }, 300);
  };

  const handleReset = () => {
    setSearch('');
    setDifficulty('all');
    setCategory('all');
    onFilterChange({
      search: '',
      difficulty: null,
      category: null
    });
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="searchQuestion" className="block text-sm font-medium text-gray-300 mb-1">
            Search Questions
          </label>
          <div className="relative">
            <input
              id="searchQuestion"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by question text..."
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {categories && categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="self-end">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionFilter;
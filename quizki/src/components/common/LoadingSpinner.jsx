// components/common/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };
  
  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    green: 'border-green-500',
    purple: 'border-purple-500',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const colorClass = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`animate-spin ${sizeClass} border-4 ${colorClass} rounded-full border-t-transparent`}></div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['blue', 'white', 'green', 'purple']),
};

export default LoadingSpinner;
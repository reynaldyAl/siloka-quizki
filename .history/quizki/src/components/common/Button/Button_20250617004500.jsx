<<<<<<< HEAD
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  theme = 'default',
  icon = null,
  ...rest
}) => {
  const baseStyles = 'font-medium rounded focus:outline-none transition duration-200';
  
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-teal-500 hover:bg-teal-600 text-white',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
    link: 'bg-transparent text-blue-500 hover:text-blue-700 underline p-0',
  };
  
  const sizeStyles = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4',
    large: 'py-3 px-6 text-lg',
  };
  
  const themeStyles = {
    default: '',
    space: 'space-theme-button',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.medium}
    ${themeStyles[theme] || ''}
    ${widthStyles}
    ${disabledStyles}
    ${className}
  `.trim();
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className="button-icon mr-2">{icon}</span>}
      {children}
      {theme === 'space' && <span className="button-stars"></span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'dark', 'link'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  theme: PropTypes.oneOf(['default', 'space']),
  icon: PropTypes.node,
};

export default Button;
=======
// components/common/Button/Button.jsx - Reusable button component
>>>>>>> e85f0e13d8e3b3286f18120973bcb0b9e6dfe05a

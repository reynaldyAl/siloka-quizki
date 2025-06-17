import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  type = 'text',
  label,
  id,
  name,
  value,
  placeholder = '',
  disabled = false,
  readOnly = false,
  error = '',
  helperText = '',
  required = false,
  className = '',
  inputClassName = '',
  onChange,
  onBlur,
  onFocus,
  ...rest
}, ref) => {
  const inputClasses = `
    appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
    ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${readOnly ? 'bg-gray-50 cursor-default' : ''}
    ${inputClassName}
  `.trim();
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        value={value}
        className={inputClasses}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper-text` : undefined}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-helper-text`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func
};

export default Input;
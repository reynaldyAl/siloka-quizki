import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  shadow = true,
  border = true,
  padding = true,
  darkMode = true
}) => {
  const cardClasses = `
    ${darkMode ? 'bg-gray-800' : 'bg-white'} 
    rounded-lg overflow-hidden
    ${shadow ? 'shadow-md' : ''}
    ${border ? darkMode ? 'border border-gray-700' : 'border border-gray-200' : ''}
    ${className}
  `.trim();

  const headerClasses = `
    px-4 py-3 
    ${darkMode ? 'border-b border-gray-700 bg-gray-900' : 'border-b border-gray-200 bg-gray-50'}
    ${headerClassName}
  `.trim();

  const bodyClasses = `
    ${padding ? 'p-4' : ''}
    ${bodyClassName}
  `.trim();

  const footerClasses = `
    px-4 py-3 
    ${darkMode ? 'border-t border-gray-700 bg-gray-900' : 'border-t border-gray-200 bg-gray-50'}
    ${footerClassName}
  `.trim();

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className={headerClasses}>
          {title && <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>}
          {subtitle && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{subtitle}</p>}
        </div>
      )}
      <div className={bodyClasses}>{children}</div>
      {footer && <div className={footerClasses}>{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  shadow: PropTypes.bool,
  border: PropTypes.bool,
  padding: PropTypes.bool,
  darkMode: PropTypes.bool
};

export default Card;
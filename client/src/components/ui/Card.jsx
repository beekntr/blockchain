import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-md p-6 
      hover:shadow-lg transition-shadow
      dark:bg-gray-800 dark:text-white
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card; 
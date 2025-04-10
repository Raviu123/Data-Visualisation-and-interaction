import React, { useState, useEffect } from 'react';

const Card = ({ title, insights, children, className }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`w-full mb-4 md:mb-6 bg-white shadow-lg rounded-lg ${className || ''}`}>
      {title && (
        <div className="p-3 md:p-4 border-b">
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>{title}</h2>
        </div>
      )}
      <div className="p-3 md:p-4">
        <div className={`${children?.props?.className || ''}`}>{children}</div>
        {insights && (
          <p className={`mt-3 md:mt-4 text-gray-600 ${isMobile ? 'text-xs leading-relaxed' : 'text-sm'}`}>
            {insights}
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;
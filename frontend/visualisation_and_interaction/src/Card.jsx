import React from 'react';

const Card = ({ title, insights, children }) => {
  return (
    <div className="w-full mb-6 bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-4">
        <div className="h-80">{children}</div>
        {insights && (
          <p className="mt-4 text-gray-600 text-sm">{insights}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
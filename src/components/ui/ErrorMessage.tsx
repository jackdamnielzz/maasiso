import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  retry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '', retry }) => {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative ${className}`} role="alert">
      <div className="flex items-center justify-between">
        <div>
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{message}</span>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Opnieuw proberen
          </button>
        )}
      </div>
    </div>
  );
}; 
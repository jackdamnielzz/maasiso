import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  actionLabel?: string;
}

export function ErrorFallback({
  error,
  resetError,
  message = 'An unexpected error occurred',
  actionLabel = 'Try again'
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || message}
        </p>
        {resetError && (
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

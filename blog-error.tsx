'use client';

import React, { useEffect } from 'react';
import { ErrorFallback } from './src/components/common/ErrorFallback';

/**
 * Props for the ErrorBoundary component
 */
export interface BlogErrorBoundaryProps {
  /** The error that was caught */
  error: Error;
  /** Function to reset the error state */
  reset: () => void;
}

/**
 * Error boundary component for the blog section
 */
export default function BlogErrorBoundary({
  error,
  reset
}: BlogErrorBoundaryProps): React.ReactElement {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Blog Error Boundary caught error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }, [error]);

  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container-custom">
        <ErrorFallback
          error={error}
          resetError={reset}
          message="An error occurred while loading the blog"
        />
      </div>
    </div>
  );
}
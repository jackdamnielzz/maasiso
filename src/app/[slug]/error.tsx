'use client';

import { useEffect, useState } from 'react';
import { monitoringService } from '@/lib/monitoring/service';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Track error in monitoring service
    monitoringService.trackError(error, {
      context: {
        componentName: 'DynamicPage',
        location: typeof window !== 'undefined' ? window.location.href : '',
        digest: error.digest,
        retryCount
      },
      severity: 'error',
      handled: true
    });

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Page Error:');
      console.error('Error:', error);
      console.log('Error Digest:', error.digest);
      console.groupEnd();
    }
  }, [error, error.digest, retryCount]);

  const handleReset = async () => {
    if (retryCount >= MAX_RETRIES) {
      // If max retries reached, do a full page reload
      window.location.reload();
      return;
    }

    setIsRetrying(true);
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);

    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      setRetryCount(prev => prev + 1);
      reset();
    } catch (retryError) {
      console.error('Error during retry:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong!</h1>
      <p className="text-lg text-gray-600">
        {process.env.NODE_ENV === 'development' 
          ? error.message || 'An unexpected error occurred'
          : 'We encountered an error while loading this page.'}
      </p>
      
      {process.env.NODE_ENV === 'development' && error.digest && (
        <p className="text-sm text-gray-500">
          Error Digest: {error.digest}
        </p>
      )}

      {retryCount > 0 && (
        <p className="text-sm text-gray-500">
          Retry attempt {retryCount} of {MAX_RETRIES}
        </p>
      )}

      <button
        onClick={handleReset}
        disabled={isRetrying}
        className={`rounded-lg px-6 py-2 text-white transition-colors ${
          isRetrying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isRetrying ? 'Retrying...' : retryCount >= MAX_RETRIES ? 'Reload Page' : 'Try again'}
      </button>

      {retryCount >= MAX_RETRIES && (
        <p className="text-sm text-gray-500">
          Still having issues? Please try refreshing the page.
        </p>
      )}
    </div>
  );
}

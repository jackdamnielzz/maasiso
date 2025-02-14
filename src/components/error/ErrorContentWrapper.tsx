'use client';

import { Suspense } from 'react';
import ErrorContent from './ErrorContent';

interface ErrorContentWrapperProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorContentWrapper({ error, reset }: ErrorContentWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
          <div className="flex justify-center gap-4">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    }>
      <ErrorContent error={error} reset={reset} />
    </Suspense>
  );
}
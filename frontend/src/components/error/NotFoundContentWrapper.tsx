'use client';

import { Suspense } from 'react';
import NotFoundContent from './NotFoundContent';

export default function NotFoundContentWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mx-auto mb-8"></div>
          <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}
'use client';

import { Suspense } from 'react';
import SearchFilters from './SearchFilters';

export default function SearchFiltersWrapper() {
  return (
    <Suspense fallback={
      <div className="space-y-4 bg-white rounded-lg shadow-lg p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <SearchFilters />
    </Suspense>
  );
}
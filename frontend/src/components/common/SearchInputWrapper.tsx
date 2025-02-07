'use client';

import { Suspense } from 'react';
import SearchInput from './SearchInput';

export default function SearchInputWrapper() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm animate-pulse bg-gray-100">
        <div className="h-5 bg-gray-200 rounded"></div>
      </div>
    }>
      <SearchInput />
    </Suspense>
  );
}
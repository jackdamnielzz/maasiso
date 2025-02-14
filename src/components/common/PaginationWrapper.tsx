'use client';

import { Suspense } from 'react';
import Pagination from './Pagination';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationWrapper({ currentPage, totalPages }: PaginationWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center mt-8 space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-md bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    }>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </Suspense>
  );
}
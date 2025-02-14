'use client';

import { Suspense } from 'react';
import CategoryFilter from './CategoryFilter';
import { Category } from '@/lib/types';

interface CategoryFilterWrapperProps {
  categories: Category[];
  selectedCategory?: string;
  defaultLabel?: string;
  onHover?: (categorySlug: string) => void;
}

export default function CategoryFilterWrapper(props: CategoryFilterWrapperProps) {
  return (
    <Suspense fallback={
      <div className="mb-8">
        <div className="w-full md:w-64 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm animate-pulse">
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <CategoryFilter {...props} />
    </Suspense>
  );
}
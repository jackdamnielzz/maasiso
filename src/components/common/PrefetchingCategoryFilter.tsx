'use client';

import { Category } from '@/lib/types';
import CategoryFilterWrapper from './CategoryFilterWrapper';
import { prefetch } from '@/lib/prefetch';
import { getBlogPosts } from '@/lib/api';

interface PrefetchingCategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
}

export default function PrefetchingCategoryFilter({
  categories,
  selectedCategory,
}: PrefetchingCategoryFilterProps) {
  const handleHover = async (categorySlug: string) => {
    try {
      // Only prefetch if it's a different category
      if (categorySlug !== selectedCategory) {
        await prefetch(() => getBlogPosts(1, 6));
      }
    } catch (error) {
      // Ignore prefetch errors but log them in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Prefetch error:', error);
      }
    }
  };

  return (
    <CategoryFilterWrapper
      categories={categories}
      selectedCategory={selectedCategory}
      onHover={handleHover}
    />
  );
}
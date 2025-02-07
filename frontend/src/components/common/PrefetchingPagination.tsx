'use client';

import { prefetch } from '@/lib/prefetch';
import { getBlogPosts } from '@/lib/api';
import Pagination from './Pagination';

interface PrefetchingPaginationProps {
  currentPage: number;
  totalPages: number;
  selectedCategory?: string;
}

export default function PrefetchingPagination({
  currentPage,
  totalPages,
  selectedCategory,
}: PrefetchingPaginationProps) {
  const handleHover = async (page: number) => {
    if (page > currentPage) {
      try {
        await prefetch(() => getBlogPosts(page - 1, 6, selectedCategory));
      } catch {
        // Ignore prefetch errors
      }
    }
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onHover={handleHover}
    />
  );
}
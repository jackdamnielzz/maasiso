'use client';

import { Suspense } from 'react';
import NewsPageClient from './NewsPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NewsArticle, Category } from '@/lib/types';

interface NewsPageClientWrapperProps {
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageClientWrapper({
  categories,
  articles
}: NewsPageClientWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    }>
      <NewsPageClient
        categories={categories}
        articles={articles}
      />
    </Suspense>
  );
}
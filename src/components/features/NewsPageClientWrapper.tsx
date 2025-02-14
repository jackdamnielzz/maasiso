'use client';

import { Suspense } from 'react';
import NewsPageClient from './NewsPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NewsArticle, Category, Page } from '@/lib/types';

interface NewsPageClientWrapperProps {
  page: Page;
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageClientWrapper({
  page,
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
        page={page}
        categories={categories}
        articles={articles}
      />
    </Suspense>
  );
}
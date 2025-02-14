'use client';

import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import NewsPageContent from './NewsPageServer';
import { NewsArticle, Category, Page } from '@/lib/types';

interface NewsPageClientProps {
  page: Page;
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageClient({ page, categories, articles }: NewsPageClientProps) {
  const [isPending] = useTransition();
  const searchParams = useSearchParams();

  // Safe parameter extraction with error handling
  const getParam = (key: string) => {
    try {
      return searchParams?.get(key) ?? null;
    } catch (e) {
      console.error(`Error accessing search param ${key}:`, e);
      return null;
    }
  };

  const pageParam = getParam('page');
  const category = getParam('category');

  // Parse page number safely
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  if (isPending) {
    return <div className="opacity-50">Loading...</div>;
  }

  return (
    <NewsPageContent
      currentPage={currentPage}
      selectedCategory={category || undefined}
      page={page}
      categories={categories}
      articles={articles}
    />
  );
}

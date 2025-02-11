'use client';

import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import NewsPageContent from './NewsPageServer';
import { NewsArticle, Category } from '@/lib/types';

interface NewsPageClientProps {
  categories: Category[];
  articles: NewsArticle[];
}

export default function NewsPageClient({ categories, articles }: NewsPageClientProps) {
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

  const category = getParam('category');
  
  if (isPending) {
    return <div className="opacity-50">Loading...</div>;
  }

  return (
    <NewsPageContent
      selectedCategory={category || undefined}
      categories={categories}
      articles={articles}
    />
  );
}

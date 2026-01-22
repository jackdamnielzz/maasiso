import { Metadata } from 'next';
import { Suspense } from 'react';
import NewsPageServer from '@/components/features/NewsPageServer';
import SearchInput from '@/components/features/SearchInput';
import { getNewsArticles, getPage } from '@/lib/api';
import { NewsArticle } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Nieuws en Updates',
  description: 'Blijf op de hoogte van het laatste nieuws en belangrijke updates',
  openGraph: {
    title: 'Nieuws en Updates',
    description: 'Blijf op de hoogte van het laatste nieuws en belangrijke updates',
    type: 'website'
  }
};

interface NewsPageProps {
  searchParams?: {
    page?: string;
    category?: string;
    search?: string;
  };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  // Parse parameters with proper type checking and defaults
  const params = await Promise.resolve(searchParams ?? {});
  const currentPage = Math.max(1, parseInt(String(params.page ?? '1'), 10));

  // Fetch all required data
  const [newsResponse, pageData] = await Promise.all([
    getNewsArticles(currentPage, 6),
    getPage('news')
  ]);

  // Handle case where page data is not found
  if (!pageData) {
    throw new Error('News page content not found');
  }

  // Filter out any null values from the articles array
  const validArticles = newsResponse.articles.filter((article): article is NewsArticle => article !== null);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsPageServer
        page={pageData}
        articles={validArticles}
      />
    </Suspense>
  );
}

import { Metadata } from 'next';
import { Suspense } from 'react';
import NewsPageServer from '@/components/features/NewsPageServer';
import SearchInput from '@/components/features/SearchInput';
import { getNewsArticles, getCategories, getPage } from '@/lib/api';

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
  const selectedCategory = String(params.category ?? '') || undefined;

  // Fetch all required data
  const [newsResponse, categoriesResponse, pageData] = await Promise.all([
    getNewsArticles(currentPage, 6),
    getCategories(),
    getPage('news')
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsPageServer
        currentPage={currentPage}
        selectedCategory={selectedCategory}
        page={pageData}
        categories={categoriesResponse}
        articles={newsResponse.newsArticles.data}
      />
    </Suspense>
  );
}

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
  try {
    // Parse parameters with proper type checking and defaults
    const params = await Promise.resolve(searchParams ?? {});
    const currentPage = Math.max(1, parseInt(String(params.page ?? '1'), 10));

    // Fetch all required data
    const [newsResponse, pageData] = await Promise.all([
      getNewsArticles(currentPage, 6),
      getPage('news')
    ]);

    // Create default page data if not found
    const validatedPageData = pageData || {
      id: 'news',
      title: 'Nieuws',
      slug: 'news',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Filter out any null values from the articles array
    const validArticles = newsResponse.articles.filter((article): article is NewsArticle => article !== null);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <NewsPageServer
          page={validatedPageData}
          articles={validArticles}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading news page:', error);
    
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Fout</h2>
          <p className="text-red-600">Er is een fout opgetreden bij het laden van de nieuwsberichten.</p>
        </div>
      </div>
    );
  }
}

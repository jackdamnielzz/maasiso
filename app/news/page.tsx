import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchInputWrapper from '@/components/features/SearchInputWrapper';
import NewsPageClientWrapper from '@/components/features/NewsPageClientWrapper';
import { getNewsArticles, getPage, getCategories } from '@/lib/api';

export default async function NewsPage() {
  // Fetch initial data
  const pageSize = 6;
  const currentPage = 1;

  try {
    const [page, categories, articlesResponse] = await Promise.all([
      getPage('news'),
      getCategories(),
      getNewsArticles(currentPage, pageSize)
    ]);

    const articles = articlesResponse.newsArticles.data;

    return (
      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container-custom">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Nieuws en Updates van <span className="text-[#FF8B00]">MaasISO</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Blijf op de hoogte van het laatste nieuws over informatiebeveiliging,
                ISO-certificering en privacywetgeving.
              </p>
            </div>
          </div>
        </section>

        {/* News Content Section */}
        <section className="bg-gray-50 py-16">
          <div className="container-custom">
            <SearchInputWrapper />
            <Suspense fallback={<LoadingSpinner />}>
              <NewsPageClientWrapper
                page={page}
                categories={categories}
                articles={articles}
              />
            </Suspense>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading news page:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Er is een fout opgetreden bij het laden van de nieuwsberichten.
        </p>
      </div>
    );
  }
}

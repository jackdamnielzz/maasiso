import { Suspense } from 'react';
import { Metadata } from 'next';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchInputWrapper from '@/components/features/SearchInputWrapper';
import NewsPageClientWrapper from '@/components/features/NewsPageClientWrapper';
import { getNewsArticles, getPage } from '@/lib/api';
import { NewsArticle } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nieuws en Updates | MaasISO - ISO Certificering & Informatiebeveiliging',
  description: 'Blijf op de hoogte van het laatste nieuws over informatiebeveiliging, ISO-certificering en privacywetgeving van MaasISO.',
  keywords: 'nieuws, updates, ISO certificering, informatiebeveiliging, privacy, AVG, GDPR, MaasISO'
};

export default async function NewsPage() {
  // Match client-side page size
  const PAGE_SIZE = 10;
  const currentPage = 1;
  
  // Fetch page data first to ensure consistent timestamps
  const page = await getPage('news');
  try {
    console.log('[NewsPage] Fetching articles with params:', { currentPage, PAGE_SIZE });
    const articlesResponse = await getNewsArticles(currentPage, PAGE_SIZE);
    
    // Log raw featured image data
    console.log('[NewsPage] Raw featured image data:', articlesResponse.articles.map(article => ({
      articleId: article.id,
      imageData: article.featuredImage,
      rawUrl: article.featuredImage?.url
    })));
    
    // Validate response structure
    console.log('[NewsPage] Raw API Response:', {
      hasResponse: !!articlesResponse,
      responseType: typeof articlesResponse,
      isArray: Array.isArray(articlesResponse?.articles),
      articleCount: articlesResponse?.articles?.length
    });

    // Debug logging for API response
    console.log('[NewsPage] API Response Debug:', {
      responseReceived: !!articlesResponse,
      articlesPresent: !!articlesResponse?.articles,
      articlesLength: articlesResponse?.articles?.length,
      responseStructure: JSON.stringify(articlesResponse)
    });

    // Debug logging
    console.log('Articles Response:', articlesResponse);

    // Log raw article data before processing
    console.log('[NewsPage] Raw articles data:', articlesResponse.articles.map(article => ({
      id: article?.id,
      title: article?.title,
      featuredImage: {
        exists: !!article?.featuredImage,
        url: article?.featuredImage?.url,
        formats: article?.featuredImage?.formats,
      }
    })));

    // Detailed validation of articles array
    const articles = (articlesResponse.articles || []).filter((article): article is NewsArticle => {
      if (!article) {
        console.warn('[NewsPage] Filtered out null article');
        return false;
      }
      
      // Log article structure before serialization
      console.log('[NewsPage] Article structure:', {
        id: article.id,
        hasTitle: !!article.title,
        contentLength: article.content?.length,
        hasValidDates: {
          created: !!article.createdAt && !isNaN(new Date(article.createdAt).getTime()),
          updated: !!article.updatedAt && !isNaN(new Date(article.updatedAt).getTime()),
          published: article.publishedAt ? !isNaN(new Date(article.publishedAt).getTime()) : 'not set'
        },
        nestedObjects: {
          hasTags: Array.isArray(article.tags),
          hasCategories: Array.isArray(article.categories),
          hasFeaturedImage: !!article.featuredImage
        }
      });
      
      return article !== null;
    });

    console.log('[NewsPage] Filtered articles:', {
      originalCount: articlesResponse.articles?.length,
      filteredCount: articles.length,
      nullsRemoved: (articlesResponse.articles?.length || 0) - articles.length
    });

    if (!page) {
      throw new Error('Failed to fetch page data');
    }

    // Ensure page has required fields
    const validatedPage = {
      id: page.id || 'news',
      title: page.title || 'Nieuws',
      slug: page.slug || 'news',
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: page.updatedAt || new Date().toISOString()
    };

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
            <Suspense fallback={<LoadingSpinner />}>
              <NewsPageClientWrapper articles={articles} page={page} />
            </Suspense>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading news page:', error);
    
    // More detailed error handling
    let errorMessage = 'Er is een fout opgetreden bij het laden van de nieuwsberichten.';
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch page')) {
        errorMessage = 'De pagina-informatie kon niet worden geladen. Probeer het later opnieuw.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Er is een netwerkfout opgetreden. Controleer uw internetverbinding.';
      }
    }

    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Fout</h2>
          <p className="text-red-600">{errorMessage}</p>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <pre className="mt-4 p-4 bg-red-100 rounded text-sm overflow-auto">
              {error.stack}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

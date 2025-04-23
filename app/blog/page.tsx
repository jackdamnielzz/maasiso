import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BlogPageClientWrapper from '@/components/features/BlogPageClientWrapper';
import { getBlogPosts, getPage } from '@/lib/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | MaasISO',
  description: 'Lees onze laatste blog posts over ISO certificering en kwaliteitsmanagement',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const PAGE_SIZE = 10;
  const currentPage = 1;

  // Fetch page data first to ensure consistent timestamps
  const page = await getPage('blog');
  try {
    const { posts, total } = await getBlogPosts(currentPage, PAGE_SIZE);

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format: posts is not an array');
    }

    if (!page) {
      throw new Error('Failed to fetch page data');
    }

    // Ensure page has required fields
    const validatedPage = {
      id: page.id || 'blog',
      title: page.title || 'Blog',
      slug: page.slug || 'blog',
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
                Blog van <span className="text-[#FF8B00]">MaasISO</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Ontdek onze inzichten en expertise over ISO certificering,
                kwaliteitsmanagement en bedrijfsprocessen.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content Section */}
        <section className="bg-gray-50 py-16">
          <div className="container-custom">
            <Suspense fallback={<LoadingSpinner />}>
              <BlogPageClientWrapper page={validatedPage} initialPosts={posts} />
            </Suspense>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading blog page:', error);
    
    // More detailed error handling
    let errorMessage = 'Er is een fout opgetreden bij het laden van de blog posts.';
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
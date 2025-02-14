import { getBlogPosts, getCategories } from '@/lib/api';
import BlogCard from '@/components/features/BlogCard';
import Pagination from '@/components/common/Pagination';
import CategoryFilter from '@/components/common/CategoryFilter';
import { BlogPost } from '@/lib/types';
import { Suspense } from 'react';
import { prefetch } from '../../lib/prefetch';

// Prefetch function for next page
async function prefetchNextPage(currentPage: number, pageSize: number, categorySlug?: string) {
  const nextPage = currentPage + 1;
  await prefetch(() => getBlogPosts(nextPage, pageSize, categorySlug));
}

// Prefetch function for category data
async function prefetchCategory(categorySlug: string, pageSize: number) {
  await prefetch(() => getBlogPosts(1, pageSize, categorySlug));
}

interface BlogPageProps {
  searchParams: { 
    page?: string;
    category?: string;
  };
}

async function BlogContent({ searchParams }: BlogPageProps) {
  try {
    const currentPage = typeof searchParams.page === 'string' 
      ? parseInt(searchParams.page) 
      : 1;
    
    const selectedCategory = typeof searchParams.category === 'string'
      ? searchParams.category
      : undefined;

    const [response, categoriesResponse] = await Promise.all([
      getBlogPosts(currentPage, 6, selectedCategory),
      getCategories()
    ]).catch(() => {
      throw new Error(
        'Er is een fout opgetreden bij het ophalen van de blog artikelen. ' +
        'Controleer uw internetverbinding en probeer het opnieuw.'
      );
    });

    if (!response || !categoriesResponse) {
      throw new Error('Geen data ontvangen van de server.');
    }

    if (!response.blogPosts.data || response.blogPosts.data.length === 0) {
      return (
        <div className="bg-white py-24">
          <div className="container-custom">
            <h1 className="text-4xl font-bold text-[#091E42] mb-8">
              Blog
            </h1>
            <p className="text-[#091E42]/70 mb-6 max-w-2xl">
              Ontdek onze laatste inzichten, tips en best practices op het gebied van 
              informatiebeveiliging, ISO-certificering en privacywetgeving.
            </p>
            <p className="text-[#091E42]/70">
              Geen blog artikelen gevonden.
            </p>
          </div>
        </div>
      );
    }

    // Prefetch next page in the background
    if (response.blogPosts.meta.pagination.page < response.blogPosts.meta.pagination.pageCount) {
      prefetchNextPage(currentPage, 6, selectedCategory).catch(() => {
        // Ignore prefetch errors
      });
    }

    return (
      <div className="bg-white py-24">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-[#091E42] mb-8">
            Blog
          </h1>
          <p className="text-[#091E42]/70 mb-12 max-w-2xl">
            Ontdek onze laatste inzichten, tips en best practices op het gebied van 
            informatiebeveiliging, ISO-certificering en privacywetgeving.
          </p>
          
          <CategoryFilter 
            categories={categoriesResponse.categories}
            selectedCategory={selectedCategory}
            onHover={(category) => {
              prefetchCategory(category, 6).catch(() => {
                // Ignore prefetch errors
              });
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {response.blogPosts.data.map((post: BlogPost) => (
              <div key={post.id}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {response.blogPosts.meta.pagination.pageCount > 1 && (
            <Pagination
              currentPage={response.blogPosts.meta.pagination.page}
              totalPages={response.blogPosts.meta.pagination.pageCount}
              onHover={(page) => {
                if (page > currentPage) {
                  prefetchNextPage(page - 1, 6, selectedCategory).catch(() => {
                    // Ignore prefetch errors
                  });
                }
              }}
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Er is een fout opgetreden bij het laden van de blogpagina: ${error.message}`);
    }
    throw new Error('Er is een onverwachte fout opgetreden bij het laden van de blogpagina.');
  }
}

export default async function BlogPage(props: BlogPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent {...props} />
    </Suspense>
  );
}

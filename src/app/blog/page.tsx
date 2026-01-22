import { getBlogPosts } from '@/lib/api';
import BlogCard from '@/components/features/BlogCard';
import Pagination from '@/components/common/Pagination';
import { BlogPost } from '@/lib/types';
import { Suspense } from 'react';
import { prefetch } from '../../lib/prefetch';

// Prefetch function for next page
async function prefetchNextPage(currentPage: number, pageSize: number) {
  const nextPage = currentPage + 1;
  await prefetch(() => getBlogPosts(nextPage, pageSize));
}

interface BlogPageProps {
  searchParams: {
    page?: string;
  };
}

async function BlogContent({ searchParams }: BlogPageProps) {
  try {
    const currentPage = typeof searchParams.page === 'string' 
      ? parseInt(searchParams.page) 
      : 1;

    const response = await getBlogPosts(currentPage, 6).catch(() => {
      throw new Error(
        'Er is een fout opgetreden bij het ophalen van de blog artikelen. ' +
        'Controleer uw internetverbinding en probeer het opnieuw.'
      );
    });

    if (!response) {
      throw new Error('Geen data ontvangen van de server.');
    }

    if (!response.posts || response.posts.length === 0) {
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
    const totalPages = Math.ceil(response.total / 6);
    if (currentPage < totalPages) {
      prefetchNextPage(currentPage, 6).catch(() => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {response.posts.map((post: BlogPost) => (
              <div key={post.id}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>

          {Math.ceil(response.total / 6) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(response.total / 6)}
              onHover={(page) => {
                if (page > currentPage) {
                  prefetchNextPage(page - 1, 6).catch(() => {
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

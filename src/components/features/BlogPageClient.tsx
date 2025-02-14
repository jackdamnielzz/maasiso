'use client';

import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import BlogCard from './BlogCard';
import PrefetchingPagination from '@/components/common/PrefetchingPagination';
import { BlogPost } from '@/lib/types';

interface BlogPageClientProps {
  blogPosts: BlogPost[];
  pagination: {
    page: number;
    pageCount: number;
  };
}

export default function BlogPageClient({ blogPosts, pagination }: BlogPageClientProps) {
  const [isPending] = useTransition();
  const searchParams = useSearchParams();

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
              Ontdek onze laatste inzichten, tips en best practices op het gebied van
              informatiebeveiliging, ISO-certificering en privacywetgeving.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content Section */}
      <section className={`bg-gray-50 py-16 ${isPending ? 'opacity-70' : ''}`}>
        <div className="container-custom">
          {blogPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post: BlogPost) => (
                  <div key={post.id}>
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>

              {pagination.pageCount > 1 && (
                <PrefetchingPagination
                  currentPage={pagination.page}
                  totalPages={pagination.pageCount}
                />
              )}
            </>
          ) : (
            <p className="text-[#091E42]/70">
              Geen blog artikelen gevonden.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
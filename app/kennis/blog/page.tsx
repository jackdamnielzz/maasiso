import type { Metadata } from 'next';
import { Suspense } from 'react';

import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import BlogSidebar from '@/components/features/BlogSidebar';
import BlogCard from '@/components/features/BlogCard';
import Pagination from '@/components/common/Pagination';
import { getBlogPosts } from '@/lib/api';
import { prefetch } from '@/lib/prefetch';
import type { BlogPost, Category, Tag } from '@/lib/types';
import { createSlug } from '@/lib/utils/slugUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog | MaasISO - ISO Certificering & Informatiebeveiliging',
  description:
    'Ontdek onze laatste inzichten, tips en best practices op het gebied van informatiebeveiliging, ISO-certificering en privacywetgeving.',
  alternates: {
    canonical: '/kennis/blog',
  },
};

function getTagSlug(tag: Tag): string {
  // Some API responses include a slug, but our normalized Tag type doesn't.
  // Fall back to a deterministic slug from the tag name.
  return (tag as unknown as { slug?: string }).slug || createSlug(tag.name);
}

async function prefetchNextPage(currentPage: number, pageSize: number) {
  const nextPage = currentPage + 1;
  await prefetch(() => getBlogPosts(nextPage, pageSize));
}

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

function extractCategories(posts: BlogPost[]): Category[] {
  const categoryMap = new Map<string, Category>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      const slug = getTagSlug(tag);
      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, {
          id: tag.id,
          name: tag.name,
          slug,
          description: '',
          createdAt: '',
          updatedAt: '',
        });
      }
    });
  });

  return Array.from(categoryMap.values());
}

function filterPosts(posts: BlogPost[], search?: string, category?: string | null): BlogPost[] {
  return posts.filter((post) => {
    if (category && category !== 'all') {
      const hasCategory = post.tags?.some((tag) => getTagSlug(tag) === category);
      if (!hasCategory) return false;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const contentMatch =
        post.content?.toLowerCase().includes(searchLower) ||
        (post as unknown as { Content?: string }).Content?.toLowerCase().includes(searchLower) ||
        false;
      const summaryMatch = post.summary?.toLowerCase().includes(searchLower) || false;
      const tagMatch = post.tags?.some((tag) => tag.name.toLowerCase().includes(searchLower)) || false;

      return titleMatch || contentMatch || summaryMatch || tagMatch;
    }

    return true;
  });
}

async function BlogContent({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;

  const currentPage =
    typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const selectedCategory = resolvedParams.category || null;
  const searchQuery = resolvedParams.search;

  const response = await getBlogPosts(1, 100).catch(() => {
    throw new Error(
      'Er is een fout opgetreden bij het ophalen van de blog artikelen. ' +
        'Controleer uw internetverbinding en probeer het opnieuw.'
    );
  });

  if (!response) {
    throw new Error('Geen data ontvangen van de server.');
  }

  const categories = extractCategories(response.posts);
  const filteredPosts = filterPosts(response.posts, searchQuery, selectedCategory);

  const pageSize = 6;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  if (!response.posts || response.posts.length === 0) {
    return (
      <div className="bg-white py-24">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-[#091E42] mb-8">Blog</h1>
          <p className="text-[#091E42]/70 mb-6 max-w-2xl">
            Ontdek onze laatste inzichten, tips en best practices op het gebied van
            informatiebeveiliging, ISO-certificering en privacywetgeving.
          </p>
          <p className="text-[#091E42]/70">Geen blog artikelen gevonden.</p>
        </div>
      </div>
    );
  }

  if (currentPage < totalPages) {
    prefetchNextPage(currentPage, pageSize).catch(() => {
      // Best effort
    });
  }

  return (
    <div className="bg-white py-24">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-[#091E42] mb-8">Blog</h1>
        <p className="text-[#091E42]/70 mb-8 max-w-2xl">
          Ontdek onze laatste inzichten, tips en best practices op het gebied van
          informatiebeveiliging, ISO-certificering en privacywetgeving.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <BlogSidebar
              categories={categories}
              selectedCategory={selectedCategory ?? undefined}
              searchQuery={searchQuery}
            />
          </aside>

          <div className="flex-1">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#091E42]/70">
                  Geen artikelen gevonden
                  {selectedCategory &&
                    selectedCategory !== 'all' &&
                    ` in categorie \"${
                      categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
                    }\"`}
                  {searchQuery && ` voor \"${searchQuery}\"`}
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {paginatedPosts.map((post: BlogPost) => (
                    <div key={post.id}>
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function KennisBlogPage(props: BlogPageProps) {
  return (
    <main className="flex-1 bg-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Blog', href: '/kennis/blog' },
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <BlogContent {...props} />
      </Suspense>
    </main>
  );
}

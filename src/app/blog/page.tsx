import { getBlogPosts } from '@/lib/api';
import BlogCard from '@/components/features/BlogCard';
import Pagination from '@/components/common/Pagination';
import { BlogPost, Category } from '@/lib/types';
import { Suspense } from 'react';
import BlogSidebar from '@/components/features/BlogSidebar';

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

// Extract unique categories from blog posts
function extractCategories(posts: BlogPost[]): Category[] {
  const categoryMap = new Map<string, Category>();
  
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(category => {
        if (!categoryMap.has(category.id)) {
          categoryMap.set(category.id, category);
        }
      });
    }
  });
  
  return Array.from(categoryMap.values());
}

// Filter posts by category and search query
function filterPosts(posts: BlogPost[], category?: string, search?: string): BlogPost[] {
  let filtered = posts;
  
  if (category) {
    filtered = filtered.filter(post =>
      post.categories?.some(cat => cat.slug === category)
    );
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      post.summary?.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
}

async function BlogContent({ searchParams }: BlogPageProps) {
  try {
    // Await searchParams as it's a Promise in Next.js 15
    const resolvedParams = await searchParams;
    
    const currentPage = typeof resolvedParams.page === 'string'
      ? parseInt(resolvedParams.page)
      : 1;
    const selectedCategory = resolvedParams.category;
    const searchQuery = resolvedParams.search;

    // Fetch more posts to extract categories (we'll filter client-side for now)
    const response = await getBlogPosts(1, 100).catch(() => {
      throw new Error(
        'Er is een fout opgetreden bij het ophalen van de blog artikelen. ' +
        'Controleer uw internetverbinding en probeer het opnieuw.'
      );
    });

    if (!response) {
      throw new Error('Geen data ontvangen van de server.');
    }

    // Extract categories from all posts
    const categories = extractCategories(response.posts);
    
    // Filter posts based on category and search
    const filteredPosts = filterPosts(response.posts, selectedCategory, searchQuery);
    
    // Paginate filtered posts
    const pageSize = 6;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredPosts.length / pageSize);

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


    return (
      <div className="bg-white py-24">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-[#091E42] mb-8">
            Blog
          </h1>
          <p className="text-[#091E42]/70 mb-8 max-w-2xl">
            Ontdek onze laatste inzichten, tips en best practices op het gebied van
            informatiebeveiliging, ISO-certificering en privacywetgeving.
          </p>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with categories and search */}
            <aside className="lg:w-64 flex-shrink-0">
              <BlogSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
            </aside>
            
            {/* Main content */}
            <main className="flex-1">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#091E42]/70">
                    Geen artikelen gevonden
                    {selectedCategory && ` in categorie "${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}"`}
                    {searchQuery && ` voor "${searchQuery}"`}.
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
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                    />
                  )}
                </>
              )}
            </main>
          </div>
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

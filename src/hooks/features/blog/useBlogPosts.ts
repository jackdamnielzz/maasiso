import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@/lib/types';

interface BlogParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}

async function fetchBlogPosts(params: BlogParams): Promise<BlogPost[]> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.category) searchParams.set('category', params.category);
  if (params.tag) searchParams.set('tag', params.tag);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-posts?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return response.json();
}

export function useBlogPosts(params: BlogParams = {}) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => fetchBlogPosts(params),
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    throwOnError: true,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-posts/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json() as Promise<BlogPost>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    throwOnError: true,
  });
}
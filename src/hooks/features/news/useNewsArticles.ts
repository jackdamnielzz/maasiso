import { useQuery } from '@tanstack/react-query';
import { NewsArticle } from '@/lib/types';

interface NewsParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}

async function fetchNewsArticles(params: NewsParams): Promise<NewsArticle[]> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.category) searchParams.set('category', params.category);
  if (params.tag) searchParams.set('tag', params.tag);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news-articles?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news articles');
  }

  return response.json();
}

export function useNewsArticles(params: NewsParams = {}) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: () => fetchNewsArticles(params),
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    throwOnError: true,
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ['news', slug],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news-articles/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news article');
      }
      return response.json() as Promise<NewsArticle>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    throwOnError: true,
  });
}
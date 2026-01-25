import { getBlogPosts, getNewsArticles, getWhitepapers } from '@/lib/api';
import { MetadataRoute } from 'next';
import { BlogPost, NewsArticle, Page, StrapiCollectionResponse, StrapiData, Whitepaper } from '@/lib/types';
import { REMOVED_PATHS } from '@/config/removed-urls';

export const revalidate = 0;

// Helper function for authenticated fetch to Strapi for collections not yet in api.ts
async function fetchStrapiCollection<T>(path: string): Promise<T[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!token) {
    console.error('Sitemap: NEXT_PUBLIC_STRAPI_TOKEN is missing');
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error(`Sitemap: Failed to fetch ${path}, status: ${response.status}`);
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error(`Sitemap: Error fetching ${path}:`, error);
    return [];
  }
}

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiPaginatedResponse<T> = {
  data: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();
  return trimmed.replace(/\/+$/g, '');
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === '' || trimmed === '/') return '';
  return `/${trimmed.replace(/^\/+/, '')}`;
}

function buildUrl(base: string, path: string): string {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = normalizePath(path);
  return `${normalizedBase}${normalizedPath}`.trim();
}

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

async function fetchStrapiPaginated<T>(path: string): Promise<StrapiPaginatedResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!token) {
    console.error('Sitemap: NEXT_PUBLIC_STRAPI_TOKEN is missing');
    return { data: [] };
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error(`Sitemap: Failed to fetch ${path}, status: ${response.status}`);
      return { data: [] };
    }

    const json = await response.json();
    return json as StrapiPaginatedResponse<T>;
  } catch (error) {
    console.error(`Sitemap: Error fetching ${path}:`, error);
    return { data: [] };
  }
}

async function fetchAllStrapiPages(): Promise<any[]> {
  const pageSize = 100;
  let page = 1;
  let results: any[] = [];
  let total = 0;

  do {
    const response = await fetchStrapiPaginated<any>(
      `/api/pages?pagination[page]=${page}&pagination[pageSize]=${pageSize}`
    );
    const data = response.data || [];
    results = results.concat(data);
    total = response.meta?.pagination?.total || results.length;
    page += 1;
  } while (results.length < total);

  return results;
}

async function fetchAllBlogPosts(): Promise<{ posts: BlogPost[]; total: number }> {
  const pageSize = 100;
  let page = 1;
  let posts: BlogPost[] = [];
  let total = 0;

  do {
    const result = await getBlogPosts(page, pageSize);
    posts = posts.concat(result.posts);
    total = result.total || posts.length;
    page += 1;
  } while (posts.length < total);

  return { posts, total };
}

async function fetchAllNewsArticles(): Promise<{ articles: NewsArticle[]; total: number }> {
  const pageSize = 100;
  let page = 1;
  let articles: NewsArticle[] = [];
  let total = 0;

  do {
    const result = await getNewsArticles(page, pageSize);
    articles = articles.concat(result.articles);
    total = result.total || articles.length;
    page += 1;
  } while (articles.length < total);

  return { articles, total };
}

async function fetchAllWhitepapers(): Promise<{ whitepapers: { data: StrapiData<Whitepaper>[] }; total: number }> {
  const pageSize = 100;
  let page = 1;
  let whitepapers: StrapiData<Whitepaper>[] = [];
  let total = 0;

  do {
    const result = await getWhitepapers(page, pageSize);
    whitepapers = whitepapers.concat(result.whitepapers.data);
    total = result.total || whitepapers.length;
    page += 1;
  } while (whitepapers.length < total);

  return { whitepapers: { data: whitepapers }, total };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://maasiso.nl');
  
  // Base static routes
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/over-ons',
    '/diensten',
    '/contact',
    '/blog',
    '/news',
    '/onze-voordelen',
    '/privacy-policy',
    '/terms-and-conditions',
    '/whitepaper',
    '/iso-9001',
    '/iso-14001',
    '/iso-45001',
    '/iso-16175',
    '/iso-27001',
    '/cookie-policy',
    '/avg',
    '/bio',
  ]
    .filter(route => !REMOVED_PATHS.has(route))
    .map((route) => ({
      url: buildUrl(baseUrl, route),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1 : 0.8,
    }));

  try {
    // Fetch all dynamic content in parallel with individual error handling
    const [blogResult, newsResult, whitepaperResult, pagesData] = await Promise.all([
      fetchAllBlogPosts().catch(err => {
        console.error('Sitemap: Failed to fetch blog posts:', err);
        return { posts: [] };
      }),
      fetchAllNewsArticles().catch(err => {
        console.error('Sitemap: Failed to fetch news articles:', err);
        return { articles: [] };
      }),
      fetchAllWhitepapers().catch(err => {
        console.error('Sitemap: Failed to fetch whitepapers:', err);
        return { whitepapers: { data: [] } };
      }),
      fetchAllStrapiPages().catch(err => {
        console.error('Sitemap: Failed to fetch pages:', err);
        return [];
      })
    ]);

    // Log counts for debugging
    console.log(`Sitemap: ${blogResult.posts.length} blogposts, ${newsResult.articles.length} news articles, ${whitepaperResult.whitepapers.data.length} whitepapers, ${pagesData.length} pages`);

    // Map Blog Posts
    const blogEntries: MetadataRoute.Sitemap = blogResult.posts
      .filter(post => post.slug)
      .filter(post => !REMOVED_PATHS.has(`/blog/${normalizeSlug(post.slug)}`))
      .map(post => ({
        url: buildUrl(baseUrl, `/blog/${normalizeSlug(post.slug)}`),
        lastModified: new Date(post.publishedAt || post.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    // Map News Articles
    const newsEntries: MetadataRoute.Sitemap = newsResult.articles
      .filter(article => article.slug)
      .filter(article => !REMOVED_PATHS.has(`/news/${normalizeSlug(article.slug)}`))
      .map(article => ({
        url: buildUrl(baseUrl, `/news/${normalizeSlug(article.slug)}`),
        lastModified: new Date(article.publishedAt || article.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    // Map Whitepapers
    const whitepaperEntries: MetadataRoute.Sitemap = whitepaperResult.whitepapers.data
      .filter(item => item.attributes?.slug)
      .map(item => ({
        url: buildUrl(baseUrl, `/whitepaper/${normalizeSlug(item.attributes.slug)}`),
        lastModified: new Date(item.attributes.publishedAt || item.attributes.updatedAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));

    // Map Dynamic Pages
    const dynamicPageEntries: MetadataRoute.Sitemap = pagesData
      .filter(item => {
        const rawSlug = item.attributes?.slug || item.slug;
        if (!rawSlug) return false;

        const slug = normalizeSlug(rawSlug);
        const staticSlugs = [
          '',
          'over-ons',
          'diensten',
          'contact',
          'blog',
          'news',
          'onze-voordelen',
          'privacy-policy',
          'terms-and-conditions',
          'whitepaper',
          'iso-9001',
          'iso-14001',
          'iso-45001',
          'iso-16175',
          'iso-27001',
          'cookie-policy',
          'avg',
          'bio',
          'home'
        ];

        return slug && !staticSlugs.includes(slug);
      })
      .map(item => {
        const attributes = item.attributes || item;
        const slug = normalizeSlug(attributes.slug || '');
        return {
          url: buildUrl(baseUrl, `/${slug}`),
          lastModified: new Date(attributes.publishedAt || attributes.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
        };
      });

    return [
      ...staticPages,
      ...blogEntries,
      ...newsEntries,
      ...whitepaperEntries,
      ...dynamicPageEntries
    ];

  } catch (error) {
    console.error('Critical error during sitemap generation:', error);
    // Fallback to at least the static pages
    return staticPages;
  }
}

import { MetadataRoute } from 'next';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
}

interface ApiResponse<T> {
  data: T[];
}

const strapiApiBaseUrl = process.env.STRAPI_API_URL || 'http://localhost:1337';

async function fetchWithRetry<T>(url: string, retries = 3, delay = 1000): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed for ${url}. Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2); // Exponential backoff
    } else {
      console.error(`Fetch failed for ${url} after multiple retries.`, error);
      return null; // Return null or empty data on final failure
    }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://maasiso.nl';

  // Static routes matching test expectations (18 routes)
  const routes = [
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
    '/iso-27001',
    '/iso-16175',
    '/avg',
    '/bio',
    '/cookie-policy',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  console.log(`STRAPI_API_URL used: ${strapiApiBaseUrl}`);
  console.log(`Static routes count: ${routes.length}`);

  // Fetch news articles
  let newsArticles: NewsArticle[] = [];
  const newsData = await fetchWithRetry<ApiResponse<NewsArticle>>(`${strapiApiBaseUrl}/api/news-articles`);
  if (newsData && newsData.data) {
    newsArticles = newsData.data;
  } else {
    console.error('Could not fetch news articles after retries. Sitemap will not include news.');
  }
  console.log(`News articles count: ${newsArticles.length}`);

  // Fetch blog posts
  let blogPosts: BlogPost[] = [];
  const blogData = await fetchWithRetry<ApiResponse<BlogPost>>(`${strapiApiBaseUrl}/api/blog-posts`);
  if (blogData && blogData.data) {
    blogPosts = blogData.data;
  } else {
    console.error('Could not fetch blog posts after retries. Sitemap will not include blog posts.');
  }
  console.log(`Blog posts count: ${blogPosts.length}`);

  // Map news articles to sitemap entries
  const newsPaths = newsArticles.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: article.publishedAt,
  }));

  // Map blog posts to sitemap entries
  const blogPaths = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  return [...routes, ...newsPaths, ...blogPaths];
}
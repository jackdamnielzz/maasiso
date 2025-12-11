import { MetadataRoute } from 'next';

export const revalidate = 0;

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://maasiso.nl';

  // Extended base routes including all main pages and sections
  // Note: /home is excluded (redirects to /), /test-deploy is excluded (test page), /robots.txt is excluded (not a page)
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
    '/iso-16175',
    '/iso-27001',
    '/cookie-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Fetch news articles
  let newsArticles: NewsArticle[] = [];
  try {
    const response = await fetch('http://153.92.223.23:1337/api/news-articles?pagination[pageSize]=1000');
    const data: ApiResponse<NewsArticle> = await response.json();
    newsArticles = data.data || [];
  } catch (error) {
    console.error('Failed to fetch news articles:', error);
  }

  // Fetch blog posts
  let blogPosts: BlogPost[] = [];
  try {
    const response = await fetch('http://153.92.223.23:1337/api/blog-posts?pagination[pageSize]=1000');
    const data: ApiResponse<BlogPost> = await response.json();
    blogPosts = data.data || [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
  }

  // Map news articles to sitemap entries
  const newsPaths = newsArticles.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt).toISOString(),
  }));

  // Map blog posts to sitemap entries
  const blogPaths = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt).toISOString(),
  }));

  return [...routes, ...newsPaths, ...blogPaths];
}
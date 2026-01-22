import { getBlogPosts, getNewsArticles, getWhitepapers } from '@/lib/api';
import { MetadataRoute } from 'next';
import { Page, StrapiCollectionResponse } from '@/lib/types';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maasiso.nl';
  
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
    '/iso-16175',
    '/iso-27001',
    '/cookie-policy',
    '/avg',
    '/bio',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch all dynamic content in parallel with individual error handling
    const [blogResult, newsResult, whitepaperResult, pagesData] = await Promise.all([
      getBlogPosts(1, 1000).catch(err => {
        console.error('Sitemap: Failed to fetch blog posts:', err);
        return { posts: [] };
      }),
      getNewsArticles(1, 1000).catch(err => {
        console.error('Sitemap: Failed to fetch news articles:', err);
        return { articles: [] };
      }),
      getWhitepapers(1, 1000).catch(err => {
        console.error('Sitemap: Failed to fetch whitepapers:', err);
        return { whitepapers: { data: [] } };
      }),
      // Pages collection is not yet a single function in api.ts that returns all, 
      // so we use a direct authenticated fetch
      fetchStrapiCollection<any>('/api/pages?pagination[pageSize]=1000').catch(err => {
        console.error('Sitemap: Failed to fetch pages:', err);
        return [];
      })
    ]);

    // Log counts for debugging
    console.log(`Sitemap: ${blogResult.posts.length} blogposts, ${newsResult.articles.length} news articles, ${whitepaperResult.whitepapers.data.length} whitepapers, ${pagesData.length} pages`);

    // Map Blog Posts
    const blogEntries: MetadataRoute.Sitemap = blogResult.posts
      .filter(post => post.slug)
      .map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt || post.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    // Map News Articles
    const newsEntries: MetadataRoute.Sitemap = newsResult.articles
      .filter(article => article.slug)
      .map(article => ({
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: new Date(article.publishedAt || article.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    // Map Whitepapers
    const whitepaperEntries: MetadataRoute.Sitemap = whitepaperResult.whitepapers.data
      .filter(item => item.attributes?.slug)
      .map(item => ({
        url: `${baseUrl}/whitepaper/${item.attributes.slug}`,
        lastModified: new Date(item.attributes.publishedAt || item.attributes.updatedAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));

    // Map Dynamic Pages
    const dynamicPageEntries: MetadataRoute.Sitemap = pagesData
      .filter(item => {
        const slug = item.attributes?.slug || item.slug;
        // Skip pages that are already in staticPages to avoid duplicates
        const staticSlugs = ['', 'over-ons', 'diensten', 'contact', 'blog', 'news', 'onze-voordelen', 'privacy-policy', 'terms-and-conditions', 'whitepaper', 'iso-9001', 'iso-14001', 'iso-16175', 'iso-27001', 'cookie-policy', 'avg', 'bio'];
        return slug && !staticSlugs.includes(slug);
      })
      .map(item => {
        const attributes = item.attributes || item;
        return {
          url: `${baseUrl}/${attributes.slug}`,
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

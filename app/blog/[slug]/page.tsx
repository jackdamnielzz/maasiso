import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { monitoredFetch } from '@/lib/monitoredFetch';
import { BlogPostContent } from '@/components/features/BlogPostContent';
import RelatedPosts from '@/components/features/RelatedPosts';
import ContentAnalytics from '@/components/features/ContentAnalytics';
import { Category, BlogPost } from '@/lib/types';
import logger from '@/lib/logger';
import SchemaMarkup from '@/components/ui/SchemaMarkup';

const DEFAULT_IMAGE = '/placeholder-blog.jpg';

function constructImageUrl(path: string | undefined): string {
  if (!path) return DEFAULT_IMAGE;
  const constructedUrl = (() => {
    try {
      // If it's a Strapi URL, extract just the uploads part
      if (path?.includes('153.92.223.23:1337') || path?.includes('peaceful-insight-production.up.railway.app')) {
        const match = path.match(/\/uploads\/(.+)$/);
        if (match) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://peaceful-insight-production.up.railway.app';
          return `${baseUrl}/api/assets/uploads/${match[1]}`;
        }
      }
      // For Next.js Image component, return just the path if it's an absolute URL but not a Strapi URL
      if (path?.startsWith('http') && !path.includes('153.92.223.23:1337') && !path.includes('peaceful-insight-production.up.railway.app')) {
        return path;
      }
      // For relative paths that start with /uploads/
      if (path?.startsWith('/uploads/')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        return `${baseUrl}/api/assets${path}`;
      }
      // For other relative paths
      if (path) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        return `${baseUrl}/api/assets/${path.replace(/^\/+/, '')}`;
      }
      return '/placeholder-blog.jpg';
    } catch (error) {
      console.error('[Image URL Construction Error]', { path, error });
      return '/placeholder-blog.jpg';
    }
  })();
  console.log('[Image URL]', path, '->', constructedUrl);
  return constructedUrl;
  
  // Handle undefined or empty path
  if (!path?.trim()) return DEFAULT_IMAGE;
  
  try {
    // If it's a Strapi URL, extract just the uploads part
    if (path?.includes('153.92.223.23:1337') || path?.includes('peaceful-insight-production.up.railway.app')) {
      const match = path?.match(/\/uploads\/(.+)$/);
      if (match) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://peaceful-insight-production.up.railway.app';
        return `${baseUrl}/api/assets/uploads/${match?.[1] ?? ''}`;
      }
    }
    
    // For Next.js Image component, return just the path if it's an absolute URL
    // but not a Strapi URL
    if (typeof path === 'string') {
      const safePath = path!;
      if (safePath.startsWith('http') && !safePath.includes('153.92.223.23:1337') && !safePath.includes('peaceful-insight-production.up.railway.app')) {
        return safePath;
      }
    }
    
    // For relative paths that start with /uploads/
    if (path?.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      return `${baseUrl}/api/assets${path}`;
    }
    
    // For other relative paths
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return `${baseUrl}/api/assets/${path?.replace(/^\/+/, '') ?? ''}`;
  } catch (error) {
    logger.error('[Image URL Construction Error]', { path, error });
    return DEFAULT_IMAGE;
  }
}

export const dynamic = 'force-dynamic';

const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 1.5,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

import { getBlogPostBySlug } from '@/lib/api';

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { blogPost } = await getBlogPostBySlug(slug);
    
    if (!blogPost) {
      logger.warn('[Blog Post Not Found]', { slug });
      return null;
    }
    
    return blogPost;
  } catch (error) {
    logger.error('[Blog Fetch Error]', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function getExcerpt(content: string): string {
  return content
    .replace(/[#*`]/g, '')
    .split('\n')
    .map((line: string): string => line.trim())
    .filter(Boolean)[0] || '';
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const blogPost = await getBlogPost(decodeURIComponent(resolvedParams.slug));

    if (!blogPost) {
      return {
        title: 'Blog post niet gevonden',
        description: 'De opgevraagde blog post kon niet worden gevonden.',
      };
    }

    return {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || getExcerpt(blogPost.content),
      keywords: blogPost.seoKeywords,
      openGraph: {
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || getExcerpt(blogPost.content),
        images: [constructImageUrl(blogPost.featuredImage?.url)],
      },
    };
  } catch (error) {
    logger.error('[Metadata Generation Error]', {
      slug: (await params).slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      title: 'Blog',
      description: 'MaasISO Blog',
    };
  }
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  try {
    const resolvedParams = await params;
    const blogPost = await getBlogPost(decodeURIComponent(resolvedParams.slug));

    if (!blogPost) {
      notFound();
    }

    const categoryIds = blogPost.categories?.map((cat: Category) => cat.id) || [];
    const readingTime = Math.ceil(blogPost.content.split(/\s+/).length / 200);

    const canonicalUrl = `https://maasiso.nl/blog/${blogPost.slug}`;
    const featuredImageUrl = constructImageUrl(blogPost.featuredImage?.url);

    return (
      <div className="bg-white pb-16 relative z-0">
        <SchemaMarkup
          article={{
            headline: blogPost.title,
            description: blogPost.seoDescription || getExcerpt(blogPost.content),
            datePublished: blogPost.publishedAt || blogPost.createdAt,
            dateModified: blogPost.updatedAt,
            author: {
              name: "Niels Maas",
              id: "https://maasiso.nl/over-niels-maas#author"
            },
            publisherId: "https://maasiso.nl/#professionalservice",
            mainEntityOfPage: canonicalUrl,
            image: featuredImageUrl
          }}
          breadcrumbs={{
            items: [
              { name: 'Home', item: 'https://maasiso.nl' },
              { name: 'Blog', item: 'https://maasiso.nl/blog' },
              { name: blogPost.title, item: canonicalUrl }
            ]
          }}
        />
        <ContentAnalytics
          contentType="blog"
          contentId={blogPost.id}
          title={blogPost.title}
          metadata={{
            categories: blogPost.categories?.map((cat: Category) => cat.name) || [],
            author: blogPost.author,
            publishedAt: blogPost.publishedAt,
            readingTime,
          }}
        />
        <BlogPostContent post={blogPost} />
      </div>
    );
  } catch (error) {
    logger.error('[Blog Page Error]', {
      slug: (await params).slug,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
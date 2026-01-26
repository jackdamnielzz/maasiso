import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { monitoredFetch } from '@/lib/monitoredFetch';
import { BlogPostContent } from '@/components/features/BlogPostContent';
import RelatedPosts from '@/components/features/RelatedPosts';
import ContentAnalytics from '@/components/features/ContentAnalytics';
import TldrBlock from '@/components/features/TldrBlock';
import FaqSection from '@/components/features/FaqSection';
import AuthorBox from '@/components/features/AuthorBox';
import { Category, BlogPost, Author } from '@/lib/types';
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

    // Determine OG image (use ogImage if available, fallback to featuredImage)
    const ogImageUrl = blogPost.ogImage?.url
      ? constructImageUrl(blogPost.ogImage.url)
      : constructImageUrl(blogPost.featuredImage?.url);

    return {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
      keywords: blogPost.seoKeywords,
      openGraph: {
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: blogPost.featuredImageAltText || blogPost.title,
        }],
        type: 'article',
        locale: 'nl_NL',
        siteName: 'Maas ISO',
        url: `https://maasiso.nl/blog/${resolvedParams.slug}`,
        publishedTime: blogPost.publicationDate || blogPost.publishedAt || blogPost.createdAt,
        modifiedTime: blogPost.updatedAt,
        authors: typeof blogPost.author === 'string'
          ? [blogPost.author]
          : blogPost.author?.name ? [blogPost.author.name] : ['Maas ISO'],
      },
      twitter: {
        card: 'summary_large_image',
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `/blog/${resolvedParams.slug}`,
      },
      robots: {
        index: blogPost.robotsIndex ?? true,
        follow: blogPost.robotsFollow ?? true,
        googleBot: {
          index: blogPost.robotsIndex ?? true,
          follow: blogPost.robotsFollow ?? true,
        },
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

    // Extract author details for schema
    const authorName = typeof blogPost.author === 'string'
      ? blogPost.author
      : blogPost.author?.name || 'Niels Maas';

    const authorId = typeof blogPost.author === 'object' && blogPost.author?.slug
      ? `https://maasiso.nl/auteurs/${blogPost.author.slug}#person`
      : 'https://maasiso.nl/over-niels-maas#author';

    const authorJobTitle = typeof blogPost.author === 'object'
      ? blogPost.author?.credentials
      : undefined;

    const authorImage = typeof blogPost.author === 'object'
      ? blogPost.author?.profileImage?.url
      : undefined;

    const authorSameAs = typeof blogPost.author === 'object' && blogPost.author?.linkedIn
      ? [blogPost.author.linkedIn]
      : undefined;

    return (
      <div className="bg-white pb-16 relative z-0">
        <SchemaMarkup
          article={{
            headline: blogPost.title,
            description: blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
            datePublished: blogPost.publicationDate || blogPost.publishedAt || blogPost.createdAt,
            dateModified: blogPost.updatedAt,
            author: {
              name: authorName,
              id: authorId,
              jobTitle: authorJobTitle,
              image: authorImage,
              sameAs: authorSameAs,
            },
            publisherId: 'https://maasiso.nl/#professionalservice',
            mainEntityOfPage: canonicalUrl,
            image: featuredImageUrl,
          }}
          faq={blogPost.faq && blogPost.faq.length > 0 ? {
            questions: blogPost.faq.map(item => ({
              question: item.question,
              answer: item.answer
            }))
          } : undefined}
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
            author: authorName,
            publishedAt: blogPost.publishedAt,
            readingTime,
          }}
        />

        {/* TL;DR Section - appears before main content */}
        {blogPost.tldr && blogPost.tldr.length > 0 && (
          <div className="container mx-auto px-4 max-w-4xl mt-8">
            <TldrBlock items={blogPost.tldr} />
          </div>
        )}

        <BlogPostContent post={blogPost} />

        {/* FAQ Section */}
        {blogPost.faq && blogPost.faq.length > 0 && (
          <div className="container mx-auto px-4 max-w-4xl">
            <FaqSection items={blogPost.faq} />
          </div>
        )}

        {/* Author Box */}
        <div className="container mx-auto px-4 max-w-4xl">
          <AuthorBox author={blogPost.author} />
        </div>

        {/* Related Posts */}
        {blogPost.relatedPosts && blogPost.relatedPosts.length > 0 && (
          <div className="container mx-auto px-4 max-w-4xl">
            <RelatedPosts posts={blogPost.relatedPosts} />
          </div>
        )}
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

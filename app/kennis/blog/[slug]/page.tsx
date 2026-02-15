import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';
import { BlogPostContent } from '@/components/features/BlogPostContent';
import RelatedPosts from '@/components/features/RelatedPosts';
import ContentAnalytics from '@/components/features/ContentAnalytics';
import FaqSection from '@/components/features/FaqSection';
import AuthorBox from '@/components/features/AuthorBox';
import SchemaMarkup from '@/components/ui/SchemaMarkup';
import type { BlogPost, Category } from '@/lib/types';
import logger from '@/lib/logger';
import { hasInternalLinkToCorePage } from '@/lib/governance/blogContent';
import { getBlogPostBySlug } from '@/lib/api';

const DEFAULT_IMAGE = '/placeholder-blog.jpg';

function constructImageUrl(path: string | undefined): string {
  if (!path?.trim()) return DEFAULT_IMAGE;

  try {
    // Keep non-Strapi absolute URLs as-is.
    if (
      path.startsWith('http') &&
      !path.includes('153.92.223.23:1337') &&
      !path.includes('peaceful-insight-production.up.railway.app')
    ) {
      return path;
    }

    // If it's a Strapi URL, extract just the uploads part.
    if (path.includes('153.92.223.23:1337') || path.includes('peaceful-insight-production.up.railway.app')) {
      const match = path.match(/\/uploads\/(.+)$/);
      if (match) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || 'https://peaceful-insight-production.up.railway.app';
        return `${baseUrl}/api/assets/uploads/${match[1]}`;
      }
    }

    // For relative paths that start with /uploads/
    if (path.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      return `${baseUrl}/api/assets${path}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return `${baseUrl}/api/assets/${path.replace(/^\/+/, '')}`;
  } catch (error) {
    logger.error('[Image URL Construction Error]', {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return DEFAULT_IMAGE;
  }
}

function getExcerpt(content: string): string {
  return (
    content
      .replace(/[#*`]/g, '')
      .split('\n')
      .map((line: string): string => line.trim())
      .filter(Boolean)[0] || ''
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { blogPost } = await getBlogPostBySlug(slug);

  if (!blogPost) {
    logger.warn('[Blog Post Not Found]', { slug });
    return null;
  }

  return blogPost;
}

export async function generateMetadata(
  { params }: PageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = decodeURIComponent(resolvedParams.slug);
    const blogPost = await getBlogPost(slug);

    if (!blogPost) {
      return {
        title: 'Blog post niet gevonden',
        description: 'De opgevraagde blog post kon niet worden gevonden.',
        robots: { index: false, follow: false },
      };
    }

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
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: blogPost.featuredImageAltText || blogPost.title,
          },
        ],
        type: 'article',
        locale: 'nl_NL',
        siteName: 'MaasISO',
        url: `/kennis/blog/${blogPost.slug || resolvedParams.slug}`,
        publishedTime: blogPost.publicationDate || blogPost.publishedAt || blogPost.createdAt,
        modifiedTime: blogPost.updatedAt,
        authors:
          typeof blogPost.author === 'string'
            ? [blogPost.author]
            : blogPost.author?.name
              ? [blogPost.author.name]
              : ['MaasISO'],
      },
      twitter: {
        card: 'summary_large_image',
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `/kennis/blog/${blogPost.slug || resolvedParams.slug}`,
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
    const resolved = await params;
    logger.error('[Metadata Generation Error]', {
      slug: resolved.slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      title: 'Blog',
      description: 'MaasISO Blog',
    };
  }
}

export default async function KennisBlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const blogPost = await getBlogPost(slug);

  if (!blogPost) {
    notFound();
  }

  const readingTime = Math.ceil(blogPost.content.split(/\s+/).length / 200);
  const canonicalPath = `/kennis/blog/${blogPost.slug || resolvedParams.slug}`;
  const canonicalUrl = `https://www.maasiso.nl${canonicalPath}`;
  const featuredImageUrl = constructImageUrl(blogPost.featuredImage?.url);

  const authorName =
    typeof blogPost.author === 'string' ? blogPost.author : blogPost.author?.name || 'Niels Maas';
  const authorId =
    typeof blogPost.author === 'object' && blogPost.author?.slug
      ? `https://www.maasiso.nl/auteurs/${blogPost.author.slug}#person`
      : 'https://www.maasiso.nl/over-niels-maas#author';
  const authorJobTitle = typeof blogPost.author === 'object' ? blogPost.author?.credentials : undefined;
  const authorImage = typeof blogPost.author === 'object' ? blogPost.author?.profileImage?.url : undefined;
  const authorSameAs =
    typeof blogPost.author === 'object' && blogPost.author?.linkedIn ? [blogPost.author.linkedIn] : undefined;

  const contentForGovernanceCheck =
    blogPost.content || (blogPost as unknown as { Content?: string }).Content || '';
  if (!hasInternalLinkToCorePage(contentForGovernanceCheck)) {
    logger.warn('[Governance] Blog post mist interne link naar core page', {
      slug: blogPost.slug,
    });
  }

  return (
    <main className="flex-1 bg-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
          { label: 'Blog', href: '/kennis/blog' },
          { label: blogPost.title, href: canonicalPath },
        ]}
      />

      <div className="bg-white pb-16 relative z-0">
        <SchemaMarkup
          article={{
            headline: blogPost.title,
            description:
              blogPost.seoDescription || blogPost.excerpt || getExcerpt(blogPost.content),
            datePublished: blogPost.publicationDate || blogPost.publishedAt || blogPost.createdAt,
            dateModified: blogPost.updatedAt,
            author: {
              name: authorName,
              id: authorId,
              jobTitle: authorJobTitle,
              image: authorImage,
              sameAs: authorSameAs,
            },
            publisherId: 'https://www.maasiso.nl/#professionalservice',
            mainEntityOfPage: canonicalUrl,
            image: featuredImageUrl,
          }}
          faq={
            blogPost.faq && blogPost.faq.length > 0
              ? {
                  questions: blogPost.faq.map((item) => ({
                    question: item.question,
                    answer: item.answer,
                  })),
                }
              : undefined
          }
          breadcrumbs={{
            items: [
              { name: 'Home', item: 'https://www.maasiso.nl' },
              { name: 'Blog', item: 'https://www.maasiso.nl/kennis/blog' },
              { name: blogPost.title, item: canonicalUrl },
            ],
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

        <BlogPostContent post={blogPost} tldrItems={blogPost.tldr} />

        {blogPost.faq && blogPost.faq.length > 0 && (
          <div className="container mx-auto px-4 max-w-4xl">
            <FaqSection items={blogPost.faq} />
          </div>
        )}

        <div className="container mx-auto px-4 max-w-4xl">
          <AuthorBox author={blogPost.author} />
        </div>

        {blogPost.relatedPosts && blogPost.relatedPosts.length > 0 && (
          <div className="container mx-auto px-4 max-w-4xl">
            <RelatedPosts posts={blogPost.relatedPosts} />
          </div>
        )}
      </div>
    </main>
  );
}


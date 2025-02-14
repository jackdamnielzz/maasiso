import { getBlogPostBySlug } from '../../../src/lib/api';
import BlogPostContent from '../../../src/components/features/BlogPostContent';
import RelatedPosts from '../../../src/components/features/RelatedPosts';
import ContentAnalytics from '../../../src/components/features/ContentAnalytics';
import { Metadata } from 'next';
import { Category } from '@/lib/types';
import { ReactNode } from 'react';

interface PageParams {
  slug: string;
}

interface BlogPostPageProps {
  params: Promise<PageParams>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { blogPost } = await getBlogPostBySlug(resolvedParams.slug);

    if (!blogPost) {
      return {
        title: 'Blog post niet gevonden',
        description: 'De opgevraagde blog post kon niet worden gevonden.'
      };
    }

    return {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || getExcerpt(blogPost.content),
      keywords: blogPost.seoKeywords,
      openGraph: {
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || getExcerpt(blogPost.content),
        images: blogPost.featuredImage?.url
          ? [`${process.env.NEXT_PUBLIC_ASSET_PREFIX}${blogPost.featuredImage.url}`]
          : undefined
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog',
      description: 'MaasISO Blog'
    };
  }
}

function getExcerpt(content: string): string {
  // Remove Markdown syntax and get first paragraph
  return content
    .replace(/[#*`]/g, '') // Remove Markdown syntax
    .split('\n')
    .map((line: string): string => line.trim())
    .filter(Boolean)[0] || '';
}

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<ReactNode> {
  try {
    const resolvedParams = await params;
    const { blogPost } = await getBlogPostBySlug(resolvedParams.slug);

    if (!blogPost) {
      throw new Error('Blog post niet gevonden');
    }

    const categoryIds: string[] = blogPost.categories.map((cat: Category): string => cat.id);

    return (
      <main className="flex min-h-screen flex-col">
        <section className="w-full bg-white py-24">
          <div className="container-custom">
            <ContentAnalytics
              contentType="blog"
              contentId={blogPost.id}
              title={blogPost.title}
              metadata={{
                categories: blogPost.categories.map((cat: Category): string => cat.name),
                author: blogPost.author,
                publishedAt: blogPost.publishedAt,
                readingTime: Math.ceil(blogPost.content.split(/\s+/).length / 200) // Estimate reading time (words/200 per minute)
              }}
            />
            <BlogPostContent post={blogPost} />
            
            <div className="mt-16">
              <RelatedPosts 
                currentSlug={blogPost.slug}
                categoryIds={categoryIds}
              />
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Er is een fout opgetreden bij het laden van de blog post: ${error.message}`);
    }
    throw new Error('Er is een onverwachte fout opgetreden bij het laden van de blog post.');
  }
}

import { getBlogPostBySlug } from '@/lib/api';
import BlogPostContent from '@/components/features/BlogPostContent';
import RelatedPosts from '@/components/features/RelatedPosts';
import { Metadata } from 'next';
import { BlogPost } from '@/lib/types';

// Configure dynamic segments
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: { slug: string }
}

async function validateSlug(slug: string): Promise<void> {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug parameter');
  }
  if (slug.length > 200) {
    throw new Error('Slug is too long');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug contains invalid characters');
  }
}

async function getBlogPostData(slug: string): Promise<{ blogPost: BlogPost | null }> {
  const decodedSlug = decodeURIComponent(slug);
  await validateSlug(decodedSlug);
  console.log('Fetching blog post with slug:', decodedSlug);
  return getBlogPostBySlug(decodedSlug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    const { blogPost } = await getBlogPostBySlug(decodedSlug);

    if (!blogPost) {
      console.warn('Blog post not found for metadata');
      return {
        title: 'Blog post niet gevonden',
        description: 'De opgevraagde blog post kon niet worden gevonden.'
      };
    }

    const metadata: Metadata = {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || getExcerpt(blogPost.content),
      keywords: blogPost.seoKeywords,
      openGraph: {
        title: blogPost.seoTitle || blogPost.title,
        description: blogPost.seoDescription || getExcerpt(blogPost.content),
        images: blogPost.featuredImage?.url 
          ? [`${process.env.NEXT_PUBLIC_ASSET_PREFIX || ''}${blogPost.featuredImage.url}`]
          : undefined
      }
    };

    console.log('Generated metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
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
    .map(line => line.trim())
    .filter(Boolean)[0] || '';
}

// Disable static params generation since we're using dynamic rendering
export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params }: PageProps) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    const { blogPost } = await getBlogPostBySlug(decodedSlug);

    if (!blogPost) {
      throw new Error('Blog post niet gevonden');
    }

    // Validate required blog post fields
    if (!blogPost.title || !blogPost.content) {
      console.error('Invalid blog post data:', { 
        hasTitle: !!blogPost.title, 
        hasContent: !!blogPost.content 
      });
      throw new Error('Blog post data is incomplete');
    }

    console.log('Blog post data:', {
      id: blogPost.id,
      title: blogPost.title,
      contentLength: blogPost.content.length,
      tags: blogPost.tags?.length ?? 0,
      hasFeaturedImage: !!blogPost.featuredImage
    });

    return (
      <div className="blog-post-container max-w-7xl mx-auto px-4 py-8">
        <BlogPostContent post={blogPost} />
        <div className="mt-16">
          <RelatedPosts currentSlug={blogPost.slug} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('BlogPostPage error:', error);
    
    if (error instanceof Error) {
      switch(error.message) {
        case 'Missing parameters':
        case 'Missing slug parameter':
          throw new Error('Blog post URL ontbreekt');
        case 'Invalid slug parameter':
        case 'Slug is too long':
        case 'Slug contains invalid characters':
          throw new Error('Ongeldige blog post URL');
        case 'Blog post niet gevonden':
          throw new Error('Blog post niet gevonden');
        case 'Blog post data is incomplete':
          throw new Error('Blog post data is onvolledig');
        case 'Failed to fetch blog post':
          throw new Error('Kan blog post niet laden door een API fout');
        default:
          console.error('Unexpected error details:', error.stack);
          throw new Error(`Er is een fout opgetreden bij het laden van de blog post: ${error.message}`);
      }
    }
    
    console.error('Non-Error object thrown:', error);
    throw new Error('Er is een onverwachte fout opgetreden bij het laden van de blog post.');
  }
}

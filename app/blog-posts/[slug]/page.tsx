import { Metadata, ResolvingMetadata } from 'next';
import { getBlogPostBySlug } from '@/lib/api';
import BlogPostClient from './BlogPostClient';

type PageParams = { slug: string };
type SearchParams = { [key: string]: string | string[] | undefined };

type PageProps = {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const { blogPost } = await getBlogPostBySlug(resolvedParams.slug);
    
    if (!blogPost) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.',
      };
    }

    return {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || '',
      keywords: blogPost.seoKeywords || '',
      openGraph: blogPost.featuredImage ? {
        images: [{ url: blogPost.featuredImage.url }],
      } : undefined,
    };
  } catch (error: unknown) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
}

export default async function BlogPost({ params }: PageProps) {
  await params; // Ensure params are resolved
  return <BlogPostClient />;
}

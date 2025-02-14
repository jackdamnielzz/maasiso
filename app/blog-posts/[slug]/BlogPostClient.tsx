'use client';

import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/api';
import { Category } from '@/lib/types';
import { useParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function BlogPostContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [blogPost, setBlogPost] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadBlogPost() {
      try {
        const { blogPost } = await getBlogPostBySlug(slug);
        setBlogPost(blogPost);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load blog post'));
      }
    }

    loadBlogPost();
  }, [slug]);

  if (error) {
    if (error.message.includes('404')) {
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-lg text-gray-600">The blog post "{slug}" could not be found.</p>
          </div>
        </main>
      );
    }
    throw error;
  }

  if (!blogPost) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
        
        {/* Meta information */}
        <div className="text-gray-600 mb-4">
          {blogPost.publishedAt && (
            <time dateTime={blogPost.publishedAt}>
              {new Date(blogPost.publishedAt).toLocaleDateString()}
            </time>
          )}
          {blogPost.author && (
            <span className="ml-4">By {blogPost.author}</span>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center">
          {blogPost.categories.map((category: Category, index: number) => (
            <span key={category.id}>
              {category.name}
              {index < blogPost.categories.length - 1 && ' '}
            </span>
          ))}
        </div>
      </header>

      {/* Featured Image */}
      {blogPost.featuredImage && (
        <div className="mb-8">
          <img
            src={blogPost.featuredImage.url}
            alt={blogPost.featuredImage.alternativeText || blogPost.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blogPost.content }}
      />
    </article>
  );
}

export default function BlogPostClient() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <BlogPostContent />
    </Suspense>
  );
}
'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring, measurePageLoad } from '@/lib/monitoring/performance';
import { BlogPost } from '@/lib/types';
import BlogPostContent from './BlogPostContent';
import RelatedPosts from './RelatedPosts';
import ContentAnalytics from './ContentAnalytics';
import ErrorBoundary from '../common/ErrorBoundary';

interface BlogPostPerformanceProps {
  post: BlogPost;
}

export default function BlogPostPerformance({ post }: BlogPostPerformanceProps) {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Measure initial page load
    measurePageLoad(`blog-${post.slug}`);

    // Clean up is handled by the monitoring utilities
  }, [post.slug]);

  return (
    <div className="bg-white py-24">
      <div className="container-custom">
        <ErrorBoundary
          fallback={
            <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800">
              <p className="text-sm">Analytics kon niet worden geladen</p>
            </div>
          }
        >
          <ContentAnalytics
            contentType="blog"
            contentId={String(post.id)}
            title={post.title}
            metadata={{
              tags: post.tags?.map(tag => tag.name) || [],
              categories: post.categories?.map(category => category.name) || [],
              author: post.author,
              publishedAt: post.publishedAt,
              readingTime: Math.ceil(post.content.split(/\s+/).length / 200)
            }}
          />
        </ErrorBoundary>

        <BlogPostContent post={post} />
        
        <div className="mt-16">
          <ErrorBoundary
            fallback={
              <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800">
                <p className="text-sm">Gerelateerde artikelen konden niet worden geladen</p>
              </div>
            }
          >
            <RelatedPosts currentSlug={post.slug} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

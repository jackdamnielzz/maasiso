'use client';

import React from 'react';
import { BlogPageClient } from './BlogPageClient';
import { ErrorMessage } from '../ui/ErrorMessage';
import { BlogPost, Page } from '@/lib/types';

interface BlogPageClientWrapperProps {
  page: Page;
  initialPosts: BlogPost[];
}

class BlogErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[BlogErrorBoundary] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          message="Er is een fout opgetreden bij het weergeven van de blog posts."
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default function BlogPageClientWrapper({
  page,
  initialPosts
}: BlogPageClientWrapperProps) {
  // Validate props before passing to client component
  const validatedPosts = initialPosts.filter(post => (
    post &&
    post.id &&
    post.title &&
    post.createdAt &&
    !isNaN(new Date(post.createdAt).getTime())
  ));

  // The blog listing page should remain usable even if the Strapi "blog" page
  // document is missing or temporarily invalid. In that case we fall back to a
  // minimal, hard-coded Page object while still rendering the posts.
  const hasValidPage = !!(page && page.id);

  if (!hasValidPage) {
    console.warn('[BlogPageClientWrapper] Missing or invalid page data, using fallback page configuration');
  }

  const safePage: Page = hasValidPage
    ? page
    : {
        id: 'blog-fallback',
        title: 'Blog',
        slug: 'blog',
        seoMetadata: {
          metaTitle: 'Blog | MaasISO',
          metaDescription: 'Ontdek onze laatste inzichten over ISO certificering en kwaliteitsmanagement.',
          keywords: 'blog, ISO, certificering, kwaliteitsmanagement'
        },
        layout: [],
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

  return (
    <BlogErrorBoundary>
      <BlogPageClient
        page={safePage}
        initialPosts={validatedPosts}
      />
    </BlogErrorBoundary>
  );
}
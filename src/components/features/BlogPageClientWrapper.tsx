'use client';

import React from 'react';
import { BlogPageClient } from './BlogPageClient';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
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

  if (!page || !page.id) {
    console.error('[BlogPageClientWrapper] Invalid page data');
    return <ErrorMessage message="Ongeldige pagina-informatie" />;
  }

  return (
    <BlogErrorBoundary>
      <BlogPageClient
        page={page}
        initialPosts={validatedPosts}
      />
    </BlogErrorBoundary>
  );
}
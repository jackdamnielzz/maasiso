'use client';

import React from 'react';
import { NewsPageClient } from './NewsPageClient';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { NewsArticle, Page } from '@/lib/types';

interface NewsPageClientWrapperProps {
  page: Page;
  articles: NewsArticle[];
}

class NewsErrorBoundary extends React.Component<
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
    console.error('[NewsErrorBoundary] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          message="Er is een fout opgetreden bij het weergeven van de nieuwsartikelen."
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default function NewsPageClientWrapper({
  page,
  articles
}: NewsPageClientWrapperProps) {
  // Validate props before passing to client component
  const validatedArticles = articles.filter(article => (
    article &&
    article.id &&
    article.title &&
    article.createdAt &&
    !isNaN(new Date(article.createdAt).getTime())
  ));

  // Log validation results
  console.log('[NewsPageClientWrapper] Props validation:', {
    hasPage: !!page,
    pageDetails: {
      id: page?.id,
      title: page?.title,
      hasValidDates: page ? {
        created: !!page.createdAt && !isNaN(new Date(page.createdAt).getTime()),
        updated: !!page.updatedAt && !isNaN(new Date(page.updatedAt).getTime())
      } : null
    },
    articlesCount: {
      original: articles.length,
      validated: validatedArticles.length,
      invalid: articles.length - validatedArticles.length
    }
  });

  if (!page || !page.id) {
    console.error('[NewsPageClientWrapper] Invalid page data');
    return <ErrorMessage message="Ongeldige pagina-informatie" />;
  }

  return (
    <NewsErrorBoundary>
      <NewsPageClient
        page={page}
        initialArticles={validatedArticles}
      />
    </NewsErrorBoundary>
  );
}
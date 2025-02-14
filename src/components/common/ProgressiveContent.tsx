import React from 'react';
import { useProgressiveContent } from '@/hooks/useProgressiveContent';

interface ProgressiveContentProps<T> {
  loadContent: () => Promise<T>;
  renderContent: (content: T) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  priority?: boolean;
  monitoringKey?: string;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function ProgressiveContent<T>({
  loadContent,
  renderContent,
  renderLoading,
  renderError,
  priority = false,
  monitoringKey,
  threshold,
  rootMargin,
  className = ''
}: ProgressiveContentProps<T>) {
  const { ref, content, loading, error } = useProgressiveContent(loadContent, {
    priority,
    monitoringKey,
    threshold,
    rootMargin
  });

  const defaultLoadingComponent = (
    <div data-testid="loading-skeleton" className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const defaultErrorComponent = (err: Error) => (
    <div data-testid="error-message" className="text-red-500">
      <p>Error loading content:</p>
      <p>{err.message}</p>
    </div>
  );

  return (
    <div ref={ref} data-testid="progressive-content" className={className}>
      {loading ? (
        renderLoading?.() ?? defaultLoadingComponent
      ) : error ? (
        renderError?.(error) ?? defaultErrorComponent(error)
      ) : content ? (
        renderContent(content)
      ) : null}
    </div>
  );
}

// Example usage:
/*
<ProgressiveContent
  loadContent={() => fetch('/api/data').then(res => res.json())}
  renderContent={(data) => (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  )}
  renderLoading={() => <CustomLoadingComponent />}
  renderError={(error) => <CustomErrorComponent error={error} />}
  priority={false}
  monitoringKey="home-content"
/>
*/

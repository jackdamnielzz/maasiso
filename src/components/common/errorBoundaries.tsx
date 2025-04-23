import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

// Higher-order component for error boundary
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// API error boundary with specific message and retry action
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          message="Failed to load data. Please check your connection and try again."
          actionLabel="Retry"
          resetError={() => window.location.reload()}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Runtime error boundary with generic error message
export function RuntimeErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          message="Something unexpected happened. Our team has been notified."
          actionLabel="Refresh Page"
          resetError={() => window.location.reload()}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Form error boundary with form-specific message
export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          message="There was a problem with the form. Please try again."
          actionLabel="Reset Form"
          resetError={() => window.location.reload()}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Export the withErrorBoundary HOC with pre-configured fallbacks
export function withApiErrorBoundary<P extends object>(Component: React.ComponentType<P>) {
  return withErrorBoundary(Component, 
    <ErrorFallback
      message="Failed to load data. Please check your connection and try again."
      actionLabel="Retry"
      resetError={() => window.location.reload()}
    />
  );
}

export function withRuntimeErrorBoundary<P extends object>(Component: React.ComponentType<P>) {
  return withErrorBoundary(Component,
    <ErrorFallback
      message="Something unexpected happened. Our team has been notified."
      actionLabel="Refresh Page"
      resetError={() => window.location.reload()}
    />
  );
}

// Re-export base components
export { ErrorBoundary, ErrorFallback };

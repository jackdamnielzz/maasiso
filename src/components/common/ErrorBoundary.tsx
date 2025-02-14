'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return (
          <div data-testid="error-boundary">
            {this.props.fallback}
          </div>
        );
      }

      return (
        <div 
          data-testid="error-boundary"
          className="p-4 rounded-lg bg-red-50 text-red-800"
        >
          <h2 className="text-lg font-semibold mb-2">Er is iets misgegaan</h2>
          <p className="text-sm text-red-600">
            {this.state.error?.message || 'Probeer de pagina te verversen.'}
          </p>
        </div>
      );
    }

    return (
      <div data-testid="error-boundary">
        {this.props.children}
      </div>
    );
  }
}

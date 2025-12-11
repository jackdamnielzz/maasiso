interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  type: 'error' | 'warning' | 'info';
  source: 'react' | 'network' | 'javascript' | 'promise' | 'other';
  timestamp: number;
  url: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

class ErrorMonitor {
  private static instance: ErrorMonitor;
  private isInitialized = false;

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        type: 'error',
        source: 'javascript',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        metadata: {
          filename: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'error',
        source: 'promise',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        metadata: {
          reason: event.reason,
        },
      });
    });

    // Patch fetch to monitor network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.logError({
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            type: 'error',
            source: 'network',
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: window.navigator.userAgent,
            metadata: {
              endpoint: this.getEndpointFromFetchArgs(args),
              status: response.status,
              statusText: response.statusText,
            },
          });
        }
        return response;
      } catch (error) {
        const err = error as Error;
        this.logError({
          message: err.message || 'Network Error',
          stack: err.stack,
          type: 'error',
          source: 'network',
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: window.navigator.userAgent,
          metadata: {
            endpoint: this.getEndpointFromFetchArgs(args),
          },
        });
        throw error;
      }
    };

    this.isInitialized = true;
  }

  private getEndpointFromFetchArgs(args: Parameters<typeof fetch>): string {
    const input = args[0];
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    if (input instanceof Request) return input.url;
    return 'unknown';
  }

  logError(details: ErrorDetails) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', details);
    }

    // TODO: Send error to monitoring service
    // This could be Sentry, custom endpoint, etc.
    // Example:
    // fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify(details),
    // });
  }

  // Method for React error boundaries to log errors
  logComponentError(error: Error, componentStack: string) {
    this.logError({
      message: error.message,
      stack: error.stack,
      componentStack,
      type: 'error',
      source: 'react',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    });
  }

  // Method for logging warnings
  logWarning(message: string, metadata?: Record<string, unknown>) {
    this.logError({
      message,
      type: 'warning',
      source: 'other',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      metadata,
    });
  }
}

export const errorMonitor = ErrorMonitor.getInstance();
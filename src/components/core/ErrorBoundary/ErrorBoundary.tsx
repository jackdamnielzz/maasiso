import React from 'react';
import { Typography } from '@/components/core/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import { errorMonitor } from '@/providers/MonitoringProvider';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  errorTitle?: string;
  errorRetryText?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorRef = React.createRef<HTMLDivElement>();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to our monitoring system
    errorMonitor.logComponentError(error, errorInfo.componentStack || 'No component stack available');
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Focus the error message when it appears
    if (!prevState.error && this.state.error && this.errorRef.current) {
      this.errorRef.current.focus();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { 
      children, 
      fallback: FallbackComponent,
      errorTitle = 'Er is iets misgegaan',
      errorRetryText = 'Probeer opnieuw'
    } = this.props;

    if (error) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} reset={this.reset} />;
      }

      return (
        <Card 
          className="mx-auto max-w-lg mt-8"
          role="alert"
          aria-labelledby="error-title"
          aria-describedby="error-message"
          ref={this.errorRef}
          tabIndex={-1}
        >
          <CardHeader>
            <CardTitle id="error-title">{errorTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Typography 
              variant="muted"
              id="error-message"
            >
              {error.message || 'Er is een onverwachte fout opgetreden.'}
            </Typography>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={this.reset}
                aria-label={`${errorRetryText} na fout: ${error.message}`}
              >
                {errorRetryText}
              </Button>
              {/* Skip link for keyboard users */}
              <Button 
                variant="link" 
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                Pagina opnieuw laden
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

// Default error fallback component that can be used by other components
export function DefaultErrorFallback({ 
  error, 
  reset,
  errorTitle = 'Er is iets misgegaan',
  errorRetryText = 'Probeer opnieuw'
}: { 
  error: Error; 
  reset: () => void;
  errorTitle?: string;
  errorRetryText?: string;
}) {
  const errorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Focus the error message when component mounts
    errorRef.current?.focus();
  }, []);

  return (
    <Card 
      className="mx-auto max-w-lg mt-8"
      role="alert"
      aria-labelledby="error-title"
      aria-describedby="error-message"
      ref={errorRef}
      tabIndex={-1}
    >
      <CardHeader>
        <CardTitle id="error-title">{errorTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Typography 
          variant="muted"
          id="error-message"
        >
          {error.message || 'Er is een onverwachte fout opgetreden.'}
        </Typography>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={reset}
            aria-label={`${errorRetryText} na fout: ${error.message}`}
          >
            {errorRetryText}
          </Button>
          {/* Skip link for keyboard users */}
          <Button 
            variant="link" 
            onClick={() => window.location.reload()}
            className="text-sm"
          >
            Pagina opnieuw laden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
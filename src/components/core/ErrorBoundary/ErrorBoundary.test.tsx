import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, DefaultErrorFallback } from './ErrorBoundary';
import { errorMonitor } from '@/providers/MonitoringProvider';

// Mock error monitor
jest.mock('@/providers/MonitoringProvider', () => ({
  errorMonitor: {
    logComponentError: jest.fn(),
  },
}));

// Test component that throws an error
function ThrowError({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI with proper ARIA attributes when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-labelledby', 'error-title');
    expect(errorContainer).toHaveAttribute('aria-describedby', 'error-message');
  });

  it('focuses error message when error occurs', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(document.activeElement).toBe(errorContainer);
  });

  it('logs error to monitoring system', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(errorMonitor.logComponentError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(String)
    );
  });

  it('resets error state when retry button is clicked', () => {
    const Harness = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <>
          <button onClick={() => setShouldThrow(false)}>Stop throwing</button>
          <ErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    };

    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Stop throwing' }));
    const retryButton = screen.getByRole('button', { name: /probeer opnieuw/i });
    fireEvent.click(retryButton);

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('supports custom error messages', () => {
    render(
      <ErrorBoundary errorTitle="Custom Error" errorRetryText="Try Again">
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders custom fallback component when provided', () => {
    const CustomFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
      <div role="alert">
        Custom error: {error.message}
        <button onClick={reset}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText(/custom error: test error/i)).toBeInTheDocument();
  });

  it('provides reload option for keyboard users', () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('link', { name: /pagina opnieuw laden/i });
    fireEvent.click(reloadButton);
    expect(mockReload).toHaveBeenCalled();
  });
});

describe('DefaultErrorFallback', () => {
  it('renders with proper accessibility attributes', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<DefaultErrorFallback error={error} reset={reset} />);

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-labelledby', 'error-title');
    expect(errorContainer).toHaveAttribute('aria-describedby', 'error-message');
  });

  it('focuses error message on mount', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<DefaultErrorFallback error={error} reset={reset} />);

    const errorContainer = screen.getByRole('alert');
    expect(document.activeElement).toBe(errorContainer);
  });

  it('supports custom error messages', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(
      <DefaultErrorFallback
        error={error}
        reset={reset}
        errorTitle="Custom Error"
        errorRetryText="Try Again"
      />
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset function when retry button is clicked', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<DefaultErrorFallback error={error} reset={reset} />);

    const retryButton = screen.getByRole('button', { name: /probeer opnieuw/i });
    fireEvent.click(retryButton);
    expect(reset).toHaveBeenCalled();
  });

  it('provides descriptive button labels for screen readers', () => {
    const error = new Error('Database connection failed');
    const reset = jest.fn();

    render(<DefaultErrorFallback error={error} reset={reset} />);

    const retryButton = screen.getByRole('button', {
      name: /probeer opnieuw na fout: database connection failed/i,
    });
    expect(retryButton).toBeInTheDocument();
  });
});

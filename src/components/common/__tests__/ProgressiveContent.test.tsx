import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressiveContent } from '../ProgressiveContent';
import { monitoringService } from '@/lib/monitoring/service';
import {
  createMockLoader,
  createFailingMockLoader,
  createDelayedMockLoader,
  type ProgressiveTestData
} from '@/__tests__/utils/mockLoaders';

// Mock monitoringService
jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackPerformanceMetric: jest.fn()
  }
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ProgressiveContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
  });

  it('should render loading state initially', () => {
    const mockData = { title: 'Test' } as const;
    const loader = createMockLoader(mockData);
    const mockRenderContent = jest.fn();

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
      />
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render custom loading component when provided', () => {
    const mockData = { title: 'Test' } as const;
    const loader = createMockLoader(mockData);
    const mockRenderContent = jest.fn();
    const CustomLoading = () => <div data-testid="custom-loading">Loading...</div>;

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
        renderLoading={() => <CustomLoading />}
      />
    );

    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('should render content when loaded', async () => {
    const mockData = { title: 'Test Title' } as const;
    const loader = createMockLoader(mockData);
    const mockRenderContent = (data: typeof mockData) => (
      <div data-testid="content">{data.title}</div>
    );

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
      />
    );

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  it('should render error state when loading fails', async () => {
    const mockError = new Error('Test error');
    const loader = createFailingMockLoader(mockError);
    const mockRenderContent = jest.fn();

    render(
      <ProgressiveContent<ProgressiveTestData>
        loadContent={loader}
        renderContent={mockRenderContent}
      />
    );

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(screen.getByText('Error loading content:')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('should render custom error component when provided', async () => {
    const mockError = new Error('Test error');
    const loader = createFailingMockLoader(mockError);
    const mockRenderContent = jest.fn();
    const CustomError = ({ error }: { error: Error }) => (
      <div data-testid="custom-error">Custom Error: {error.message}</div>
    );

    render(
      <ProgressiveContent<ProgressiveTestData>
        loadContent={loader}
        renderContent={mockRenderContent}
        renderError={(error) => <CustomError error={error} />}
      />
    );

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
      expect(screen.getByText('Custom Error: Test error')).toBeInTheDocument();
    });
  });

  it('should load content immediately when priority is true', async () => {
    const mockData = { title: 'Priority Content' } as const;
    const loader = createMockLoader(mockData);
    const mockRenderContent = (data: typeof mockData) => (
      <div data-testid="content">{data.title}</div>
    );

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
        priority={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Priority Content')).toBeInTheDocument();
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should track performance metrics when monitoringKey is provided', async () => {
    const mockData = { title: 'Test' } as const;
    const loader = createMockLoader(mockData);
    const mockRenderContent = (data: typeof mockData) => (
      <div data-testid="content">{data.title}</div>
    );

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
        monitoringKey="test-content"
      />
    );

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(monitoringService.trackPerformanceMetric).toHaveBeenCalledWith({
        name: 'content_load_test-content',
        value: 0, // mocked performance.now() returns same value
        timestamp: expect.any(Number),
        context: {
          priority: false,
          inView: true
        }
      });
    });
  });

  it('should handle delayed content loading', async () => {
    const mockData = { title: 'Delayed Content' } as const;
    const loader = createDelayedMockLoader(mockData, 1000);
    const mockRenderContent = (data: typeof mockData) => (
      <div data-testid="content">{data.title}</div>
    );

    render(
      <ProgressiveContent<typeof mockData>
        loadContent={loader}
        renderContent={mockRenderContent}
      />
    );

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    // Should show loading state
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Advance timers
    jest.advanceTimersByTime(1000);

    // Should show content
    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Delayed Content')).toBeInTheDocument();
    });
  });
});

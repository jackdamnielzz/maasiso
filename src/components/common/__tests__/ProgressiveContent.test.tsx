import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ProgressiveContent } from '../ProgressiveContent';
import { monitoringService } from '@/lib/monitoring/service';
import {
  createMockLoader,
  createFailingMockLoader,
  createDelayedMockLoader,
  type ProgressiveTestData,
} from '@/__tests__/utils/mockLoaders';
import { useInView } from 'react-intersection-observer';

jest.mock('@/lib/monitoring/service', () => ({
  monitoringService: {
    trackPerformanceMetric: jest.fn(),
  },
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

const mockUseInView = useInView as jest.MockedFunction<typeof useInView>;
const refMock = jest.fn();

describe('ProgressiveContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: false,
      entry: undefined,
    });
  });

  it('renders loading state initially', async () => {
    jest.useFakeTimers();
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });
    const loader = createDelayedMockLoader({ title: 'Test' } as const, 1000);

    render(
      <ProgressiveContent loadContent={loader} renderContent={() => <div>content</div>} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('renders custom loading component when provided', async () => {
    jest.useFakeTimers();
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });
    const loader = createDelayedMockLoader({ title: 'Test' } as const, 1000);
    render(
      <ProgressiveContent
        loadContent={loader}
        renderContent={() => <div>content</div>}
        renderLoading={() => <div data-testid="custom-loading">Loading...</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('renders content when inView is true', async () => {
    const mockData = { title: 'Test Title' } as const;
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });

    render(
      <ProgressiveContent
        loadContent={createMockLoader(mockData)}
        renderContent={(data) => <div data-testid="content">{data.title}</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  it('renders error state when loading fails', async () => {
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });

    render(
      <ProgressiveContent<ProgressiveTestData>
        loadContent={createFailingMockLoader(new Error('Test error'))}
        renderContent={() => <div>content</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading content:')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('loads immediately with priority=true', async () => {
    const mockData = { title: 'Priority Content' } as const;

    render(
      <ProgressiveContent
        loadContent={createMockLoader(mockData)}
        renderContent={(data) => <div data-testid="content">{data.title}</div>}
        priority
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Priority Content')).toBeInTheDocument();
    });
  });

  it('tracks performance metrics when monitoringKey is provided', async () => {
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });

    render(
      <ProgressiveContent
        loadContent={createMockLoader({ title: 'Test' } as const)}
        renderContent={(data) => <div data-testid="content">{data.title}</div>}
        monitoringKey="test-content"
      />
    );

    await waitFor(() => {
      expect(monitoringService.trackPerformanceMetric).toHaveBeenCalledWith({
        name: 'content_load_test-content',
        value: 0,
        timestamp: expect.any(Number),
        context: {
          priority: false,
          inView: true,
        },
      });
    });
  });

  it('handles delayed content loading', async () => {
    jest.useFakeTimers();
    mockUseInView.mockReturnValue({
      ref: refMock,
      inView: true,
      entry: undefined,
    });

    render(
      <ProgressiveContent
        loadContent={createDelayedMockLoader({ title: 'Delayed Content' }, 1000)}
        renderContent={(data) => <div data-testid="content">{data.title}</div>}
      />
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Delayed Content')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});

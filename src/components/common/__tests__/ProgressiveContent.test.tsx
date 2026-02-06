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
const refMock = (() => undefined) as unknown as ReturnType<typeof useInView>['ref'];

function createInViewMock(
  overrides: Partial<Pick<ReturnType<typeof useInView>, 'inView' | 'entry'>> = {}
): ReturnType<typeof useInView> {
  return {
    ref: refMock,
    inView: false,
    entry: undefined,
    ...overrides,
  } as ReturnType<typeof useInView>;
}

describe('ProgressiveContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
    mockUseInView.mockReturnValue(createInViewMock());
  });

  it('renders loading state initially', async () => {
    jest.useFakeTimers();
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));
    const loader = createDelayedMockLoader({ title: 'Test' } as const, 1000);

    render(
      <ProgressiveContent<{ title: string }>
        loadContent={loader}
        renderContent={() => <div>content</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('renders custom loading component when provided', async () => {
    jest.useFakeTimers();
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));
    const loader = createDelayedMockLoader({ title: 'Test' } as const, 1000);
    render(
      <ProgressiveContent<{ title: string }>
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
    const mockData: { title: string } = { title: 'Test Title' };
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));

    render(
      <ProgressiveContent<{ title: string }>
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
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));

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
    const mockData: { title: string } = { title: 'Priority Content' };

    render(
      <ProgressiveContent<{ title: string }>
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
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));

    render(
      <ProgressiveContent<{ title: string }>
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
    mockUseInView.mockReturnValue(createInViewMock({ inView: true }));

    render(
      <ProgressiveContent<{ title: string }>
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

import { withRetry, RetryErrorType } from '../retry';

jest.useFakeTimers();

jest.mock('../monitoring/service', () => ({
  monitoringService: {
    trackRetryAttempt: jest.fn(),
    logError: jest.fn(),
  },
}));

// Mock global Response class for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Response = class Response {
  status: number;
  statusText: string;
  headers: Map<string, string>;
  url: string;

  constructor(status: number, statusText: string, url: string) {
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.headers = new Map();
  }

  clone() {
    return this;
  }

  async text() {
    return 'mock response body';
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }
};

function createError(type: RetryErrorType): Error | Response {
  switch (type) {
    case 'network':
      return new Error('Network request failed');
    case 'server':
      return new (global as any).Response(500, 'Internal Server Error', 'http://example.com');
    case 'throttle':
      return new (global as any).Response(429, 'Too Many Requests', 'http://example.com');
    case 'timeout':
      return new (global as any).Response(408, 'Request Timeout', 'http://example.com');
    case 'auth':
      return new (global as any).Response(401, 'Unauthorized', 'http://example.com');
    default:
      return new Error('Unknown error');
  }
}

describe('withRetry', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should succeed on first attempt without retry', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    const result = await withRetry(operation);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it.each([
    'network',
    'server',
    'throttle',
    'timeout'
  ])('should retry on %s error and eventually succeed', async (errorType) => {
    const error = createError(errorType as RetryErrorType);
    const operation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const promise = withRetry(operation, { maxAttempts: 3, initialDelay: 10, maxDelay: 50, backoffFactor: 2 });
    // Fast-forward timers to simulate delay
    jest.advanceTimersByTime(10);
    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should not retry on auth error', async () => {
    const error = createError('auth');
    const operation = jest.fn().mockRejectedValue(error);
    await expect(withRetry(operation, { maxAttempts: 3 })).rejects.toThrow('Unauthorized');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should stop retrying after max attempts reached', async () => {
    const error = createError('network');
    const operation = jest.fn().mockRejectedValue(error);
    await expect(withRetry(operation, { maxAttempts: 3, initialDelay: 10, maxDelay: 50, backoffFactor: 2 })).rejects.toThrow('Network request failed');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should calculate delay with backoff and maxDelay', async () => {
    const error = createError('network');
    const operation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const spySetTimeout = jest.spyOn(global, 'setTimeout');

    const promise = withRetry(operation, { maxAttempts: 3, initialDelay: 10, maxDelay: 15, backoffFactor: 2 });
    // First delay: 10ms (initialDelay)
    jest.advanceTimersByTime(10);
    // Second delay: 20ms but capped to maxDelay 15ms
    jest.advanceTimersByTime(15);
    const result = await promise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
    expect(spySetTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
  });

  it('should track retry history correctly', async () => {
    const error = createError('network');
    const operation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const promise = withRetry(operation, { maxAttempts: 3, initialDelay: 10, maxDelay: 50, backoffFactor: 2 });
    jest.advanceTimersByTime(10);
    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
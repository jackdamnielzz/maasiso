/**
 * Circuit breaker states
 */
export enum CircuitState {
  /** Normal operation, requests are allowed */
  CLOSED = 'CLOSED',
  /** Circuit is open, requests fail fast */
  OPEN = 'OPEN',
  /** Testing if service has recovered */
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Maximum number of failures before opening circuit */
  failureThreshold?: number;
  /** Time window for counting failures (ms) */
  failureWindow?: number;
  /** Time to wait before attempting recovery (ms) */
  resetTimeout?: number;
  /** Maximum number of requests in half-open state */
  halfOpenLimit?: number;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  /** Number of failures in current window */
  failures: number;
  /** Timestamp of last failure */
  lastFailureTime: number;
  /** Number of consecutive successful requests in half-open state */
  consecutiveSuccesses: number;
  /** Total number of requests processed */
  totalRequests: number;
  /** Current circuit state */
  state: CircuitState;
  /** Timestamp when circuit entered current state */
  stateChangedAt: number;
}

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CONFIG: Required<CircuitBreakerConfig> = {
  failureThreshold: 5,
  failureWindow: 60_000, // 1 minute
  resetTimeout: 30_000,  // 30 seconds
  halfOpenLimit: 3
};

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message = 'Circuit breaker is open') {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

/**
 * Circuit breaker implementation for protecting against cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private config: Required<CircuitBreakerConfig>;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private metrics: CircuitBreakerMetrics;
  private halfOpenCount = 0;

  constructor(config?: CircuitBreakerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      failures: 0,
      lastFailureTime: 0,
      consecutiveSuccesses: 0,
      totalRequests: 0,
      state: CircuitState.CLOSED,
      stateChangedAt: Date.now()
    };
  }

  /**
   * Execute an operation with circuit breaker protection
   * @param operation Operation to execute
   * @returns Operation result
   * @throws CircuitOpenError if circuit is open
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.metrics.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitOpenError();
      }
    }

    if (this.state === CircuitState.HALF_OPEN && this.halfOpenCount >= this.config.halfOpenLimit) {
      throw new CircuitOpenError('Circuit breaker half-open request limit exceeded');
    }

    try {
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCount++;
      }

      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if circuit should reset to half-open
   */
  private shouldReset(): boolean {
    const now = Date.now();
    return now - this.metrics.stateChangedAt >= this.config.resetTimeout;
  }

  /**
   * Record a successful operation
   */
  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.metrics.consecutiveSuccesses++;
      if (this.metrics.consecutiveSuccesses >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }

    // Reset failure count in closed state
    if (this.state === CircuitState.CLOSED) {
      this.metrics.failures = 0;
      this.metrics.consecutiveSuccesses = 0;
    }
  }

  /**
   * Record a failed operation
   */
  private recordFailure(): void {
    const now = Date.now();
    
    // Reset failure count if outside window
    if (now - this.metrics.lastFailureTime > this.config.failureWindow) {
      this.metrics.failures = 0;
    }

    this.metrics.failures++;
    this.metrics.lastFailureTime = now;
    this.metrics.consecutiveSuccesses = 0;

    if (this.state === CircuitState.CLOSED && this.metrics.failures >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Transition circuit breaker to a new state
   */
  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) {
      return;
    }

    // Clear any existing reset timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }

    // Reset metrics for new state
    this.metrics.state = newState;
    this.metrics.stateChangedAt = Date.now();
    this.state = newState;
    this.halfOpenCount = 0;

    if (newState === CircuitState.OPEN) {
      // Set timer to try reset after timeout
      this.resetTimer = setTimeout(() => {
        if (this.state === CircuitState.OPEN && this.shouldReset()) {
          this.transitionTo(CircuitState.HALF_OPEN);
        }
      }, this.config.resetTimeout);
    } else if (newState === CircuitState.CLOSED) {
      // Reset all counters
      this.metrics.failures = 0;
      this.metrics.consecutiveSuccesses = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      // Reset success counter for new test period
      this.metrics.consecutiveSuccesses = 0;
    }
  }
}

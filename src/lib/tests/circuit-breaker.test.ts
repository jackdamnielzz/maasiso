import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, CircuitState, CircuitOpenError } from '../api/circuit-breaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in closed state', () => {
      const breaker = new CircuitBreaker();
      const metrics = breaker.getMetrics();
      expect(metrics.state).toBe(CircuitState.CLOSED);
      expect(metrics.failures).toBe(0);
      expect(metrics.consecutiveSuccesses).toBe(0);
    });

    it('should accept custom configuration', () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 5000
      });
      expect(breaker.getMetrics().state).toBe(CircuitState.CLOSED);
    });
  });

  describe('State Transitions', () => {
    it('should open circuit after threshold failures', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        failureWindow: 1000
      });

      // First failure
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.CLOSED);

      // Second failure - should open circuit
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.OPEN);

      // Subsequent requests should fail fast
      await expect(breaker.execute(() => Promise.resolve('success')))
        .rejects.toThrow(CircuitOpenError);
    });

    it('should transition to half-open after reset timeout', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000
      });

      // Force circuit open
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.OPEN);

      // Advance time past reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Next request should be allowed (half-open)
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getMetrics().state).toBe(CircuitState.CLOSED);
    });

    it('should close circuit after successful recovery', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 1000
      });

      // Force circuit open
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Successful requests in half-open state
      await breaker.execute(() => Promise.resolve('success'));
      await breaker.execute(() => Promise.resolve('success'));

      // Circuit should be closed after threshold successes
      expect(breaker.getMetrics().state).toBe(CircuitState.CLOSED);
    });

    it('should reopen circuit on failure in half-open state', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 1000
      });

      // Force circuit open
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // Failure in half-open state
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.OPEN);
    });
  });

  describe('Failure Window', () => {
    it('should reset failure count after window expires', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        failureWindow: 1000
      });

      // First failure
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');

      // Wait for window to expire
      await vi.advanceTimersByTimeAsync(1100);

      // This failure should not trigger circuit open (count was reset)
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      expect(breaker.getMetrics().state).toBe(CircuitState.CLOSED);
    });
  });

  describe('Half-Open State', () => {
    it('should limit requests in half-open state', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeout: 1000,
        halfOpenLimit: 1
      });

      // Force circuit open
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1100);

      // First request in half-open should be allowed
      const firstRequestResolver: { current: ((value: string) => void) | null } = { current: null };
      const promise1 = breaker.execute(() => {
        return new Promise<string>(resolve => {
          firstRequestResolver.current = resolve;
        });
      });

      // Second request should be rejected due to limit
      const promise2 = breaker.execute(() => Promise.resolve('success'));

      await expect(promise2).rejects.toThrow(CircuitOpenError);
      if (firstRequestResolver.current) {
        firstRequestResolver.current('success');
      }
      await expect(promise1).resolves.toBe('success');
    });
  });

  describe('Metrics', () => {
    it('should track request counts', async () => {
      const breaker = new CircuitBreaker();

      await breaker.execute(() => Promise.resolve('success'));
      await breaker.execute(() => Promise.resolve('success'));
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');

      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.failures).toBe(1);
    });

    it('should track state change timestamps', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1
      });

      const startTime = Date.now();

      // Force state change
      await expect(breaker.execute(() => Promise.reject(new Error('test'))))
        .rejects.toThrow('test');

      const metrics = breaker.getMetrics();
      expect(metrics.stateChangedAt).toBeGreaterThanOrEqual(startTime);
    });
  });
});

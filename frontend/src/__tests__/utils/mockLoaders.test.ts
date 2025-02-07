import {
  createMockLoader,
  createFailingMockLoader,
  createDelayedMockLoader,
  matchesShape,
  createValidatedMockLoader,
  createStandardTestLoader,
  type ProgressiveTestData
} from './mockLoaders';

describe('Mock Loader Utilities', () => {
  describe('createMockLoader', () => {
    it('should create a mock that resolves with the provided data', async () => {
      const mockData = { test: 'data' } as const;
      const loader = createMockLoader(mockData);
      
      const result = await loader();
      expect(result).toEqual(mockData);
    });

    it('should maintain type information', async () => {
      interface TestType {
        id: number;
        name: string;
      }
      
      const mockData: TestType = { id: 1, name: 'test' };
      const loader = createMockLoader(mockData);
      
      const result = await loader();
      // TypeScript should infer result as TestType
      expect(result.id).toBe(1);
      expect(result.name).toBe('test');
    });
  });

  describe('createFailingMockLoader', () => {
    it('should create a mock that rejects with the provided error', async () => {
      const mockError = new Error('Test error');
      const loader = createFailingMockLoader(mockError);
      
      await expect(loader()).rejects.toThrow(mockError);
    });
  });

  describe('createDelayedMockLoader', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after the specified delay', async () => {
      const mockData = { test: 'data' };
      const delay = 1000;
      const loader = createDelayedMockLoader(mockData, delay);
      
      const promise = loader();
      jest.advanceTimersByTime(delay);
      const result = await promise;
      
      expect(result).toEqual(mockData);
    });

    it('should not resolve before the delay', async () => {
      const mockData = { test: 'data' };
      const delay = 1000;
      const loader = createDelayedMockLoader(mockData, delay);
      
      const promise = loader();
      jest.advanceTimersByTime(delay - 1);
      
      const resolved = jest.fn();
      promise.then(resolved);
      
      expect(resolved).not.toHaveBeenCalled();
    });
  });

  describe('matchesShape', () => {
    it('should return true for matching shapes', () => {
      const shape = { name: '', age: 0 };
      const value = { name: 'test', age: 25 };
      
      expect(matchesShape(value, shape)).toBe(true);
    });

    it('should return false for non-matching shapes', () => {
      const shape = { name: '', age: 0 };
      const value = { name: 'test', age: '25' };
      
      expect(matchesShape(value, shape)).toBe(false);
    });

    it('should return false for null or non-objects', () => {
      const shape = { test: '' };
      
      expect(matchesShape(null, shape)).toBe(false);
      expect(matchesShape(undefined, shape)).toBe(false);
      expect(matchesShape('string', shape)).toBe(false);
      expect(matchesShape(123, shape)).toBe(false);
    });
  });

  describe('createValidatedMockLoader', () => {
    it('should create a loader when data matches shape', () => {
      const mockData = { name: 'test', age: 25 };
      const shape = { name: '', age: 0 };
      
      expect(() => createValidatedMockLoader(mockData, shape)).not.toThrow();
    });

    it('should throw when data does not match shape', () => {
      const mockData = { name: 'test', age: '25' };
      const shape = { name: '', age: 0 };
      
      expect(() => createValidatedMockLoader(mockData, shape)).toThrow(TypeError);
    });

    it('should resolve with the correct data', async () => {
      const mockData = { name: 'test', age: 25 };
      const shape = { name: '', age: 0 };
      const loader = createValidatedMockLoader(mockData, shape);
      
      const result = await loader();
      expect(result).toEqual(mockData);
    });
  });

  describe('createStandardTestLoader', () => {
    it('should create a loader with standard test data', async () => {
      const loader = createStandardTestLoader();
      const result = await loader();
      
      expect(result).toMatchObject({
        id: expect.any(String),
        content: expect.any(String),
        timestamp: expect.any(Number)
      });
    });

    it('should return data matching ProgressiveTestData type', async () => {
      const loader = createStandardTestLoader();
      const result = await loader();
      
      // TypeScript type check
      const _typed: ProgressiveTestData = result;
      
      expect(typeof result.id).toMatch(/^(string|number)$/);
      expect(typeof result.content).toBe('string');
    });
  });
});

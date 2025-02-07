/**
 * Test utilities for creating type-safe mock loaders
 */

/**
 * Creates a type-safe mock loader function for use with ProgressiveContent
 * @param data The mock data to be returned by the loader
 * @returns A jest mock function that resolves with the provided data
 * @example
 * const mockData = { title: 'Test' } as const;
 * const mockLoader = createMockLoader(mockData);
 */
export function createMockLoader<T>(data: T): jest.Mock<Promise<T>> {
  return jest.fn().mockResolvedValue(data);
}

/**
 * Creates a mock loader that fails with a specific error
 * @param error The error to throw
 * @returns A jest mock function that rejects with the provided error
 * @example
 * const mockError = new Error('Failed to load');
 * const mockLoader = createFailingMockLoader(mockError);
 */
export function createFailingMockLoader(error: Error): jest.Mock<Promise<never>> {
  return jest.fn().mockRejectedValue(error);
}

/**
 * Creates a delayed mock loader for testing loading states
 * @param data The mock data to be returned
 * @param delay The delay in milliseconds
 * @returns A jest mock function that resolves with the provided data after the specified delay
 * @example
 * const mockData = { title: 'Test' } as const;
 * const mockLoader = createDelayedMockLoader(mockData, 1000);
 */
export function createDelayedMockLoader<T>(
  data: T,
  delay: number
): jest.Mock<Promise<T>> {
  return jest.fn().mockImplementation(
    () => new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    })
  );
}

/**
 * Type guard for checking if a value matches an expected type
 * @param value The value to check
 * @param shape An object describing the expected shape
 * @returns True if the value matches the expected shape
 * @example
 * const data = await loader();
 * if (matchesShape(data, { title: '' })) {
 *   // data is now typed as { title: string }
 * }
 */
export function matchesShape<T extends object>(
  value: unknown,
  shape: T
): value is T {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.keys(shape).every((key) => {
    return typeof (value as any)[key] === typeof (shape as any)[key];
  });
}

/**
 * Creates a mock loader that validates the shape of the data
 * @param data The mock data to be returned
 * @param shape An object describing the expected shape
 * @returns A jest mock function that resolves with the provided data if it matches the shape
 * @throws TypeError if the data doesn't match the expected shape
 * @example
 * interface TestData { title: string }
 * const mockData = { title: 'Test' };
 * const mockLoader = createValidatedMockLoader(mockData, { title: '' });
 */
export function createValidatedMockLoader<T extends object>(
  data: unknown,
  shape: T
): jest.Mock<Promise<T>> {
  if (!matchesShape(data, shape)) {
    throw new TypeError('Mock data does not match expected shape');
  }
  return jest.fn().mockResolvedValue(data as T);
}

/**
 * Type for progressive loading test data
 */
export interface ProgressiveTestData {
  id: string | number;
  content: string;
  [key: string]: unknown;
}

/**
 * Creates a mock loader with standard test data
 * @returns A jest mock function that resolves with standard test data
 * @example
 * const mockLoader = createStandardTestLoader();
 */
export function createStandardTestLoader(): jest.Mock<Promise<ProgressiveTestData>> {
  return createMockLoader({
    id: '1',
    content: 'Test Content',
    timestamp: Date.now()
  });
}

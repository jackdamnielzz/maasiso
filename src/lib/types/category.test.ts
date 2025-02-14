import { normalizeCategory } from '../normalizers';
import { Category } from '../types';

describe('normalizeCategory', () => {
  it('should normalize a complete category', () => {
    const input = {
      id: 'cat1',
      attributes: {
        name: 'Technology',
        description: 'Tech posts',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeCategory(input);

    expect(result).toEqual({
      id: 'cat1',
      name: 'Technology',
      description: 'Tech posts',
      slug: 'technology',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });

  it('should handle numeric id', () => {
    const input = {
      id: 123 as any,
      attributes: {
        name: 'Technology',
        description: 'Tech posts',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeCategory(input);

    expect(typeof result.id).toBe('string');
    expect(result.id).toBe('123');
  });

  it('should handle undefined optional fields', () => {
    const input = {
      id: 'cat1',
      attributes: {
        name: 'Technology',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeCategory(input);

    expect(result.description).toBeUndefined();
  });

  it('should handle minimal required fields', () => {
    const input = {
      id: 'cat1',
      attributes: {
        name: 'Technology',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeCategory(input);

    expect(result).toEqual({
      id: 'cat1',
      name: 'Technology',
      description: undefined,
      slug: 'technology',
      createdAt: '2024-01-26T20:30:00.000Z',
      updatedAt: '2024-01-26T20:30:00.000Z'
    });
  });

  it('should handle empty strings in optional fields', () => {
    const input = {
      id: 'cat1',
      attributes: {
        name: 'Technology',
        description: '',
        slug: 'technology',
        createdAt: '2024-01-26T20:30:00.000Z',
        updatedAt: '2024-01-26T20:30:00.000Z'
      }
    };

    const result = normalizeCategory(input);

    expect(result.description).toBe('');
  });
});

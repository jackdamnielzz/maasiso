import { normalizeTag } from '../normalizers';
import { Tag } from '../types';

describe('normalizeTag', () => {
  it('should normalize a complete tag', () => {
    const input = {
      id: 'tag1',
      attributes: {
        name: 'TypeScript'
      }
    };

    const result = normalizeTag(input);

    expect(result).toEqual({
      id: 'tag1',
      name: 'TypeScript'
    });
  });

  it('should handle numeric id', () => {
    const input = {
      id: 123 as any,
      attributes: {
        name: 'TypeScript'
      }
    };

    const result = normalizeTag(input);

    expect(typeof result.id).toBe('string');
    expect(result.id).toBe('123');
  });

  it('should handle empty name', () => {
    const input = {
      id: 'tag1',
      attributes: {
        name: ''
      }
    };

    const result = normalizeTag(input);

    expect(result.name).toBe('');
  });

  it('should handle nested data structure', () => {
    const input = {
      id: 'tag1',
      attributes: {
        data: {
          id: 'tag1',
          attributes: {
            name: 'TypeScript'
          }
        }
      }
    } as any;

    const result = normalizeTag(input);

    expect(result).toEqual({
      id: 'tag1',
      name: 'TypeScript'
    });
  });

  it('should handle flat structure', () => {
    const input = {
      id: 'tag1',
      name: 'TypeScript'
    } as any;

    const result = normalizeTag(input);

    expect(result).toEqual({
      id: 'tag1',
      name: 'TypeScript'
    });
  });
});

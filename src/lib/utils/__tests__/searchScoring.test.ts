import { calculateRelevanceScore } from '../searchScoring';
import type { BlogPost } from '@/lib/types';

describe('Search Scoring', () => {
  const mockBlogPost: BlogPost = {
    id: '1',
    title: 'ISO 9001 Certificering',
    content: 'Alles over ISO 9001 implementatie en certificering.',
    summary: 'ISO 9001 is een kwaliteitsmanagement norm.',
    slug: 'iso-9001',
    author: 'Test',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    publishedAt: '2025-01-01',
  } as BlogPost;

  test('should give higher score to title matches', () => {
    const { score: titleScore } = calculateRelevanceScore('ISO 9001', mockBlogPost, 'all');

    const mockWithoutTitle: BlogPost = {
      ...mockBlogPost,
      title: 'Kwaliteitsmanagement',
    };
    const { score: contentScore } = calculateRelevanceScore('ISO 9001', mockWithoutTitle, 'all');

    expect(titleScore).toBeGreaterThan(contentScore);
  });

  test('should respect scope filter - title only', () => {
    const { score } = calculateRelevanceScore('certificering', mockBlogPost, 'title');
    expect(score).toBeGreaterThan(0);
  });

  test('should give zero score when query not in scoped field', () => {
    const mockNoTitle: BlogPost = {
      ...mockBlogPost,
      title: 'Test',
    };
    const { score } = calculateRelevanceScore('certificering', mockNoTitle, 'title');
    expect(score).toBe(0);
  });

  test('should handle multi-token queries', () => {
    const { score } = calculateRelevanceScore('ISO 9001', mockBlogPost, 'all');
    expect(score).toBeGreaterThan(0);
  });
});

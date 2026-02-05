import React from 'react';
import { render, screen } from '@testing-library/react';
import DynamicNewsCard from './DynamicNewsCard';
import { NewsArticle } from '@/lib/types';

jest.mock('next/dynamic', () => {
  return () => {
    return function MockDynamicNewsCard(props: any) {
      const Comp = require('./NewsCard').default;
      return <Comp {...props} />;
    };
  };
});

jest.mock('./NewsCard', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="news-card" data-props={JSON.stringify(props)} />
}));

describe('DynamicNewsCard', () => {
  const mockArticle: NewsArticle = {
    id: '1',
    title: 'Test News Article',
    content: 'Test content',
    slug: 'test-news-article',
    createdAt: '2025-03-17T09:00:00.000Z',
    updatedAt: '2025-03-17T09:30:00.000Z',
    publishedAt: '2025-03-17T10:00:00.000Z',
    summary: 'Test summary',
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    seoKeywords: 'test, seo, keywords',
    featuredImage: {
      id: '1',
      name: 'test-image',
      width: 800,
      height: 600,
      hash: 'test-hash',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: 1000,
      url: '/test-image.jpg',
      provider: 'local',
      createdAt: '2025-03-17T09:00:00.000Z',
      updatedAt: '2025-03-17T09:00:00.000Z',
      publishedAt: '2025-03-17T09:00:00.000Z'
    }
  };

  it('rendert NewsCard component', () => {
    render(<DynamicNewsCard article={mockArticle} />);
    expect(screen.getByTestId('news-card')).toBeInTheDocument();
  });

  it('geeft article props correct door', () => {
    render(<DynamicNewsCard article={mockArticle} />);

    const props = JSON.parse(screen.getByTestId('news-card').getAttribute('data-props') || '{}');
    expect(props.article).toEqual(mockArticle);
  });

  it('geeft extra props door', () => {
    render(<DynamicNewsCard article={mockArticle} className="custom-class" />);

    const props = JSON.parse(screen.getByTestId('news-card').getAttribute('data-props') || '{}');
    expect(props.className).toBe('custom-class');
  });
});

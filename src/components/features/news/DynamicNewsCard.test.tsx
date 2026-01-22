import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DynamicNewsCard from './DynamicNewsCard';
import { NewsArticle } from '@/lib/types';

// Mock the NewsCard component
jest.mock('./NewsCard', () => {
  return function MockNewsCard(props: any) {
    return <div data-testid="news-card" data-props={JSON.stringify(props)} />;
  };
});

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
      publishedAt: '2025-03-17T09:00:00.000Z',
    },
  };

  it('shows loading state initially', () => {
    render(<DynamicNewsCard article={mockArticle} />);
    
    // Check for loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(document.querySelectorAll('.bg-gray-200').length).toBeGreaterThan(0);
  });

  it('renders NewsCard component after loading', async () => {
    render(<DynamicNewsCard article={mockArticle} />);

    // Wait for the actual NewsCard to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('news-card')).toBeInTheDocument();
    });

    // Verify props are passed correctly
    const newsCard = screen.getByTestId('news-card');
    const passedProps = JSON.parse(newsCard.getAttribute('data-props') || '{}');
    expect(passedProps.article).toEqual(mockArticle);
  });

  it('passes additional props to NewsCard', async () => {
    const className = 'custom-class';
    render(<DynamicNewsCard article={mockArticle} className={className} />);

    await waitFor(() => {
      expect(screen.getByTestId('news-card')).toBeInTheDocument();
    });

    const newsCard = screen.getByTestId('news-card');
    const passedProps = JSON.parse(newsCard.getAttribute('data-props') || '{}');
    expect(passedProps.className).toBe(className);
  });

  it('renders loading skeleton with correct structure', () => {
    render(<DynamicNewsCard article={mockArticle} />);

    // Image placeholder
    expect(document.querySelector('.h-48.w-full.bg-gray-200')).toBeInTheDocument();

    // Date placeholder
    expect(document.querySelector('.h-4.w-24.bg-gray-200')).toBeInTheDocument();

    // Title placeholder
    expect(document.querySelector('.h-6.w-3/4.bg-gray-200')).toBeInTheDocument();

    // Content placeholders (3 lines)
    const contentLines = document.querySelectorAll('.h-4.bg-gray-200');
    expect(contentLines.length).toBe(3);
  });
});
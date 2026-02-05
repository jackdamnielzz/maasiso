import React from 'react';
import { render } from '@testing-library/react';
import NewsCard from './NewsCard';
import { NewsArticle } from '@/lib/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('NewsCard', () => {
  const mockArticle: NewsArticle = {
    id: '1',
    title: 'Test News Article',
    content: 'Test content\nSecond paragraph',
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

  it('renders article title and date', () => {
    const { getByText } = render(<NewsCard article={mockArticle} />);
    
    expect(getByText('Test News Article')).toBeInTheDocument();
    expect(getByText('17 maart 2025')).toBeInTheDocument();
  });

  it('renders summary when available', () => {
    const { getByText } = render(<NewsCard article={mockArticle} />);
    expect(getByText('Test summary')).toBeInTheDocument();
  });

  it('generates excerpt from content when no summary is available', () => {
    const articleWithoutSummary = {
      ...mockArticle,
      summary: undefined,
    };
    const { getByText } = render(<NewsCard article={articleWithoutSummary} />);
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders placeholder when no image is available', () => {
    const articleWithoutImage = {
      ...mockArticle,
      featuredImage: undefined,
    };
    const { getByText } = render(<NewsCard article={articleWithoutImage} />);
    expect(getByText('Geen afbeelding beschikbaar')).toBeInTheDocument();
  });

  it('generates correct article link', () => {
    const { container } = render(<NewsCard article={mockArticle} />);
    const links = container.getElementsByTagName('a');
    expect(links[0].getAttribute('href')).toBe('/blog/test-news-article');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NewsCard article={mockArticle} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders image with correct props when available', () => {
    const { container } = render(<NewsCard article={mockArticle} />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test News Article');
  });

  it('handles markdown content in excerpt generation', () => {
    const articleWithMarkdown = {
      ...mockArticle,
      summary: undefined,
      content: '# Heading\n**Bold text**\nRegular text',
    };
    const { getByText } = render(<NewsCard article={articleWithMarkdown} />);
    expect(getByText('Heading')).toBeInTheDocument();
  });
});

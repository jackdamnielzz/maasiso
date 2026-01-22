import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DynamicBlogCard from './DynamicBlogCard';
import { BlogPost } from '@/lib/types';

// Mock the BlogCard component
jest.mock('./BlogCard', () => {
  return function MockBlogCard(props: any) {
    return <div data-testid="blog-card" data-props={JSON.stringify(props)} />;
  };
});

describe('DynamicBlogCard', () => {
  const mockPost: BlogPost = {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    slug: 'test-post',
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
    render(<DynamicBlogCard post={mockPost} />);
    
    // Check for loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(document.querySelectorAll('.bg-gray-200').length).toBeGreaterThan(0);
  });

  it('renders BlogCard component after loading', async () => {
    render(<DynamicBlogCard post={mockPost} />);

    // Wait for the actual BlogCard to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('blog-card')).toBeInTheDocument();
    });

    // Verify props are passed correctly
    const blogCard = screen.getByTestId('blog-card');
    const passedProps = JSON.parse(blogCard.getAttribute('data-props') || '{}');
    expect(passedProps.post).toEqual(mockPost);
  });

  it('passes additional props to BlogCard', async () => {
    const className = 'custom-class';
    render(<DynamicBlogCard post={mockPost} className={className} />);

    await waitFor(() => {
      expect(screen.getByTestId('blog-card')).toBeInTheDocument();
    });

    const blogCard = screen.getByTestId('blog-card');
    const passedProps = JSON.parse(blogCard.getAttribute('data-props') || '{}');
    expect(passedProps.className).toBe(className);
  });

  it('renders loading skeleton with correct structure', () => {
    render(<DynamicBlogCard post={mockPost} />);

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
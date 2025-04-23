import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('OptimizedImage', () => {
  it('renders with required props', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );
    
    const image = screen.getByRole('img', { name: 'Test image' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('shows loading state with proper announcements', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        loadingText="Custom loading text"
      />
    );

    const loadingStatus = screen.getByRole('status', { name: 'Custom loading text' });
    expect(loadingStatus).toBeInTheDocument();
    expect(screen.getByText('Custom loading text')).toHaveClass('sr-only');
  });

  it('handles error state with proper announcements', () => {
    render(
      <OptimizedImage
        src="/invalid.jpg"
        alt="Test image"
        width={100}
        height={100}
        errorText="Custom error text"
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByText('Custom error text')).toHaveClass('sr-only');
  });

  it('switches to fallback image on error', () => {
    render(
      <OptimizedImage
        src="/invalid.jpg"
        alt="Test image"
        width={100}
        height={100}
        fallback="/fallback.jpg"
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/fallback.jpg');
  });

  it('renders with figure and figcaption when caption is provided', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        caption="Test caption"
      />
    );

    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('handles decorative images correctly', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        decorative
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces image load completion', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const image = screen.getByRole('img');
    fireEvent.load(image);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Image loaded: Test image');
  });

  it('applies custom wrapper class', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        wrapperClassName="custom-wrapper"
      />
    );

    const wrapper = screen.getByRole('img').parentElement;
    expect(wrapper).toHaveClass('custom-wrapper');
  });

  it('handles loading states with proper classes', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveClass('opacity-0'); // Initial loading state

    fireEvent.load(image);
    expect(image).not.toHaveClass('opacity-0');
  });

  it('handles error states with proper classes', () => {
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(image).toHaveClass('opacity-50');
  });

  it('calls custom onError handler', () => {
    const handleError = jest.fn();
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        onError={handleError}
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(handleError).toHaveBeenCalled();
  });

  it('calls custom onLoadingComplete handler', () => {
    const handleLoadingComplete = jest.fn();
    render(
      <OptimizedImage
        src="/test.jpg"
        alt="Test image"
        width={100}
        height={100}
        onLoadingComplete={handleLoadingComplete}
      />
    );

    const image = screen.getByRole('img');
    fireEvent.load(image);
    expect(handleLoadingComplete).toHaveBeenCalled();
  });
});
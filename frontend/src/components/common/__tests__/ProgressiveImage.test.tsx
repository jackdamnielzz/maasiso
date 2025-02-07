import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProgressiveImage } from '../ProgressiveImage';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: 'test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Mock window.Image
    (window as any).Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
    };
  });

  it('should show loading state initially', () => {
    render(<ProgressiveImage {...defaultProps} />);
    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument();
  });

  it('should show image after loading', async () => {
    render(<ProgressiveImage {...defaultProps} />);

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  it('should show error state when image fails to load', async () => {
    // Mock image load failure
    (window as any).Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => this.onerror(), 0);
      }
    };

    render(<ProgressiveImage {...defaultProps} />);

    // Simulate intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    callback([{ isIntersecting: true }]);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    render(<ProgressiveImage {...defaultProps} className="custom-class" />);
    expect(screen.getByTestId('image-container')).toHaveClass('custom-class');
  });

  it('should set priority loading when specified', () => {
    render(<ProgressiveImage {...defaultProps} priority={true} />);
    expect(screen.getByAltText('Test image')).toHaveAttribute('loading', 'eager');
  });
});

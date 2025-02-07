import { render, screen, act } from '@testing-library/react';
import LazyImage from './LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation((callback) => {
  return {
    observe: jest.fn((element) => {
      // Simulate image entering viewport immediately
      callback([
        {
          isIntersecting: true,
          target: element
        }
      ]);
    }),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  };
});

window.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 800,
    height: 600
  };

  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<LazyImage {...defaultProps} />);
    
    // Check for loading placeholder
    const placeholder = screen.getByTestId('image-wrapper-/test-image.jpg')
      .querySelector('.animate-pulse');
    expect(placeholder).toBeInTheDocument();
  });

  it('loads image when in viewport', () => {
    render(<LazyImage {...defaultProps} />);

    // Image should be rendered since our mock IntersectionObserver triggers immediately
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('handles error state', () => {
    const onError = jest.fn();
    render(<LazyImage {...defaultProps} onError={onError} />);

    const image = screen.getByAltText('Test image');
    
    // Simulate image load error
    act(() => {
      image.dispatchEvent(new Event('error'));
    });

    expect(onError).toHaveBeenCalled();
  });

  it('handles load completion', () => {
    const onLoad = jest.fn();
    render(<LazyImage {...defaultProps} onLoad={onLoad} />);

    const image = screen.getByAltText('Test image');
    
    // Simulate image load completion
    act(() => {
      image.dispatchEvent(new Event('load'));
    });

    expect(onLoad).toHaveBeenCalled();
    
    // Loading placeholder should be removed
    const placeholder = screen.getByTestId('image-wrapper-/test-image.jpg')
      .querySelector('.animate-pulse');
    expect(placeholder).not.toBeInTheDocument();
  });

  it('handles priority loading', () => {
    render(<LazyImage {...defaultProps} priority />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('applies custom className', () => {
    const className = 'custom-class';
    render(<LazyImage {...defaultProps} className={className} />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass(className);
  });

  it('handles fill mode', () => {
    render(<LazyImage {...defaultProps} fill />);

    const wrapper = screen.getByTestId('image-wrapper-/test-image.jpg');
    expect(wrapper).toHaveClass('h-full w-full');
  });

  it('cleans up IntersectionObserver on unmount', () => {
    const { unmount } = render(<LazyImage {...defaultProps} />);
    
    const observer = mockIntersectionObserver.mock.results[0].value;
    
    unmount();
    
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

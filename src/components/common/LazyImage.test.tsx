import { render, screen, act } from '@testing-library/react';
import LazyImage from './LazyImage';

const mockIntersectionObserver = jest.fn();

mockIntersectionObserver.mockImplementation((callback) => ({
  observe: jest.fn((element) => {
    callback([
      {
        isIntersecting: true,
        target: element,
      },
    ]);
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('LazyImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rendert loading placeholder initieel', () => {
    render(<LazyImage {...defaultProps} />);

    const wrapper = screen.getByTestId('image-wrapper-test-image');
    expect(wrapper.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('rendert image zodra component in beeld is', () => {
    render(<LazyImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('roept onError aan bij image error', () => {
    const onError = jest.fn();
    render(<LazyImage {...defaultProps} onError={onError} />);

    const image = screen.getByAltText('Test image');
    act(() => {
      image.dispatchEvent(new Event('error'));
    });

    expect(onError).toHaveBeenCalled();
    expect(screen.getByText('Kon de afbeelding niet laden')).toBeInTheDocument();
  });

  it('roept onLoad aan en verbergt placeholder na load', () => {
    const onLoad = jest.fn();
    render(<LazyImage {...defaultProps} onLoad={onLoad} />);

    const image = screen.getByAltText('Test image');
    act(() => {
      image.dispatchEvent(new Event('load'));
    });

    expect(onLoad).toHaveBeenCalled();
    const wrapper = screen.getByTestId('image-wrapper-test-image');
    expect(wrapper.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('zet eager loading bij priority=true', () => {
    render(<LazyImage {...defaultProps} priority />);
    expect(screen.getByAltText('Test image')).toHaveAttribute('loading', 'eager');
  });

  it('past className toe op image', () => {
    render(<LazyImage {...defaultProps} className="custom-class" />);
    expect(screen.getByAltText('Test image')).toHaveClass('custom-class');
  });

  it('past fill classes toe op wrapper', () => {
    render(<LazyImage src="/test-image.jpg" alt="Test image" fill />);
    const wrapper = screen.getByTestId('image-wrapper-test-image');
    expect(wrapper).toHaveClass('h-full', 'w-full');
  });

  it('ruimt observer op bij unmount', () => {
    const { unmount } = render(<LazyImage {...defaultProps} />);
    const observer = mockIntersectionObserver.mock.results[0].value;
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

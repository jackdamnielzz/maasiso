import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressiveImage } from '../ProgressiveImage';
import { useInView } from 'react-intersection-observer';

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

const mockUseInView = useInView as jest.MockedFunction<typeof useInView>;
const refMock = (() => undefined) as unknown as ReturnType<typeof useInView>['ref'];

function createInViewMock(
  overrides: Partial<Pick<ReturnType<typeof useInView>, 'inView' | 'entry'>> = {}
): ReturnType<typeof useInView> {
  return {
    ref: refMock,
    inView: false,
    entry: undefined,
    ...overrides,
  } as ReturnType<typeof useInView>;
}

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: 'https://example.com/test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInView.mockReturnValue(createInViewMock());
  });

  it('renders image container', () => {
    render(<ProgressiveImage {...defaultProps} />);
    expect(screen.getByTestId('image-container')).toBeInTheDocument();
  });

  it('renders image element with alt text', () => {
    render(<ProgressiveImage {...defaultProps} />);
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('applies custom className on container', () => {
    render(<ProgressiveImage {...defaultProps} className="custom-class" />);
    expect(screen.getByTestId('image-container')).toHaveClass('custom-class');
  });

  it('sets eager loading when priority=true', () => {
    render(<ProgressiveImage {...defaultProps} priority />);
    expect(screen.getByAltText('Test image')).toHaveAttribute('loading', 'eager');
  });
});

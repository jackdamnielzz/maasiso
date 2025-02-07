import { render, screen, fireEvent } from '@testing-library/react';
import BlogPostError from './error';

describe('BlogPostError', () => {
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleGroup = console.group;
  const originalConsoleGroupEnd = console.groupEnd;
  const mockConsoleError = jest.fn();
  const mockConsoleGroup = jest.fn();
  const mockConsoleGroupEnd = jest.fn();

  beforeAll(() => {
    console.error = mockConsoleError;
    console.group = mockConsoleGroup;
    console.groupEnd = mockConsoleGroupEnd;
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.group = originalConsoleGroup;
    console.groupEnd = originalConsoleGroupEnd;
  });

  beforeEach(() => {
    mockConsoleError.mockClear();
    mockConsoleGroup.mockClear();
    mockConsoleGroupEnd.mockClear();
  });

  it('renders default error state correctly', () => {
    const error = new Error('Unknown error');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    // Check title and message
    expect(screen.getByText('Er is iets misgegaan')).toBeInTheDocument();
    expect(screen.getByText('Er is een fout opgetreden bij het laden van de blog post.')).toBeInTheDocument();

    // Check icon
    const icon = screen.getByRole('img', { name: 'Error icon' });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('⚠️');

    // Check retry button
    const retryButton = screen.getByText('Probeer opnieuw');
    expect(retryButton).toBeInTheDocument();
  });

  it('handles invalid URL error correctly', () => {
    const error = new Error('Ongeldige blog post URL');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    expect(screen.getByText('Ongeldige URL')).toBeInTheDocument();
    expect(screen.getByText('De opgegeven blog post URL is niet geldig.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Error icon' })).toHaveTextContent('🔍');
    expect(screen.queryByText('Probeer opnieuw')).not.toBeInTheDocument();
  });

  it('handles not found error correctly', () => {
    const error = new Error('Blog post niet gevonden');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    expect(screen.getByText('Blog post niet gevonden')).toBeInTheDocument();
    expect(screen.getByText('De opgevraagde blog post bestaat niet of is verwijderd.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Error icon' })).toHaveTextContent('📭');
    expect(screen.queryByText('Probeer opnieuw')).not.toBeInTheDocument();
  });

  it('handles incomplete data error correctly', () => {
    const error = new Error('Blog post data is onvolledig');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    expect(screen.getByText('Onvolledige content')).toBeInTheDocument();
    expect(screen.getByText('De blog post data is onvolledig. Probeer het later opnieuw.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Error icon' })).toHaveTextContent('📝');
    expect(screen.getByText('Probeer opnieuw')).toBeInTheDocument();
  });

  it('calls reset function when retry button is clicked', () => {
    const error = new Error('Unknown error');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    const retryButton = screen.getByText('Probeer opnieuw');
    fireEvent.click(retryButton);

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('logs error details to console', () => {
    const error = new Error('Test error');
    error.stack = 'Test stack trace';
    const digest = 'test-digest';
    const reset = jest.fn();

    render(<BlogPostError error={{ ...error, digest }} reset={reset} />);

    expect(mockConsoleGroup).toHaveBeenCalledWith('BlogPostError');
    expect(mockConsoleError).toHaveBeenCalledWith('Error details:', {
      message: 'Test error',
      digest: 'test-digest',
      stack: 'Test stack trace'
    });
    expect(mockConsoleGroupEnd).toHaveBeenCalled();
  });

  it('renders with accessible structure', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<BlogPostError error={error} reset={reset} />);

    // Icon should have aria-label
    expect(screen.getByRole('img', { name: 'Error icon' })).toBeInTheDocument();

    // Heading should be properly structured
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Er is iets misgegaan');

    // Button should be focusable and have clear text
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Probeer opnieuw');
  });

  it('maintains consistent styling across error types', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    const { container } = render(<BlogPostError error={error} reset={reset} />);

    // Check container styling
    expect(container.firstChild).toHaveClass('min-h-[60vh]', 'flex', 'items-center', 'justify-center', 'bg-white');

    // Check content wrapper styling
    expect(container.querySelector('.max-w-xl')).toHaveClass('mx-auto', 'px-4', 'py-8');

    // Check text styling
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-2xl', 'font-bold', 'text-[#091E42]', 'mb-4');

    // Check button styling
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'px-4',
      'py-2',
      'bg-[#FF8B00]',
      'text-white',
      'rounded-lg',
      'hover:bg-[#E67E00]',
      'transition-colors'
    );
  });
});

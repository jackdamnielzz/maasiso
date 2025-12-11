import React from 'react';
import { render, screen } from '@testing-library/react';
import Typography from './Typography';

describe('Typography', () => {
  it('renders with default props', () => {
    render(<Typography>Text</Typography>);
    const element = screen.getByText('Text');
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('leading-7');
  });

  it('renders different variants with correct elements', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    rerender(<Typography variant="blockquote">Quote</Typography>);
    expect(screen.getByText('Quote').tagName).toBe('BLOCKQUOTE');

    rerender(<Typography variant="list">List</Typography>);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('handles custom heading levels', () => {
    const { rerender } = render(
      <Typography variant="h1" level={2}>Level 2 Heading</Typography>
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(
      <Typography variant="h2" level={3}>Level 3 Heading</Typography>
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies text alignment classes', () => {
    const { rerender } = render(
      <Typography align="center">Centered Text</Typography>
    );
    expect(screen.getByText('Centered Text')).toHaveClass('text-center');

    rerender(<Typography align="right">Right Text</Typography>);
    expect(screen.getByText('Right Text')).toHaveClass('text-right');
  });

  it('handles emphasis variants', () => {
    const { rerender } = render(
      <Typography emphasis="strong">Strong Text</Typography>
    );
    expect(screen.getByText('Strong Text').tagName).toBe('STRONG');

    rerender(<Typography emphasis="em">Emphasized Text</Typography>);
    expect(screen.getByText('Emphasized Text').tagName).toBe('EM');

    rerender(<Typography emphasis="mark">Marked Text</Typography>);
    expect(screen.getByText('Marked Text').tagName).toBe('MARK');
  });

  it('supports language attributes', () => {
    render(
      <Typography lang="es" dir="ltr">
        Hola Mundo
      </Typography>
    );
    const element = screen.getByText('Hola Mundo');
    expect(element).toHaveAttribute('lang', 'es');
    expect(element).toHaveAttribute('dir', 'ltr');
  });

  it('handles visually hidden text', () => {
    const { rerender } = render(
      <Typography visuallyHidden>Hidden Text</Typography>
    );
    expect(screen.getByText('Hidden Text')).toHaveClass('sr-only');

    rerender(<Typography variant="srOnly">Screen Reader Text</Typography>);
    expect(screen.getByText('Screen Reader Text')).toHaveClass('sr-only');
  });

  it('applies appropriate ARIA roles', () => {
    const { rerender } = render(
      <Typography variant="blockquote">Quote</Typography>
    );
    expect(screen.getByRole('blockquote')).toBeInTheDocument();

    rerender(<Typography variant="list">List</Typography>);
    expect(screen.getByRole('list')).toBeInTheDocument();

    rerender(<Typography variant="lead">Introduction</Typography>);
    expect(screen.getByRole('doc-introduction')).toBeInTheDocument();
  });

  it('supports custom ARIA attributes', () => {
    render(
      <Typography
        aria-label="Custom Label"
        aria-describedby="description"
      >
        Accessible Text
      </Typography>
    );
    const element = screen.getByText('Accessible Text');
    expect(element).toHaveAttribute('aria-label', 'Custom Label');
    expect(element).toHaveAttribute('aria-describedby', 'description');
  });

  it('allows overriding element type with as prop', () => {
    render(<Typography as="span">Span Text</Typography>);
    expect(screen.getByText('Span Text').tagName).toBe('SPAN');
  });

  it('combines multiple variants correctly', () => {
    render(
      <Typography
        variant="lead"
        emphasis="strong"
        align="center"
      >
        Styled Text
      </Typography>
    );
    const element = screen.getByText('Styled Text');
    expect(element.tagName).toBe('STRONG');
    expect(element).toHaveClass('text-xl', 'text-muted-foreground', 'text-center');
  });

  it('preserves custom className while applying variants', () => {
    render(
      <Typography
        variant="h1"
        className="custom-class"
      >
        Custom Heading
      </Typography>
    );
    const element = screen.getByRole('heading', { level: 1 });
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('text-4xl');
  });

  it('handles nested typography elements', () => {
    render(
      <Typography variant="blockquote">
        Quote
        <Typography variant="small" emphasis="em">
          Citation
        </Typography>
      </Typography>
    );
    
    expect(screen.getByText('Quote').tagName).toBe('BLOCKQUOTE');
    const citation = screen.getByText('Citation');
    expect(citation.tagName).toBe('EM');
    expect(citation).toHaveClass('text-sm');
  });
});
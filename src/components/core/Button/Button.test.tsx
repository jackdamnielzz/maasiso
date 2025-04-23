import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {ui}
    </AccessibilityProvider>
  );
};

describe('Button', () => {
  it('renders with default props', () => {
    renderWithProviders(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10'); // default size
  });

  it('handles disabled state with proper ARIA attributes', () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('handles loading state with proper ARIA attributes', () => {
    renderWithProviders(<Button loading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('handles pressed state for toggle buttons', () => {
    renderWithProviders(<Button pressed>Toggle</Button>);
    const button = screen.getByRole('switch', { name: 'Toggle' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles icon-only buttons with aria-label', () => {
    renderWithProviders(
      <Button iconOnly aria-label="Close dialog">
        <svg data-testid="close-icon" />
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Close dialog' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('uses text content as aria-label for icon-only buttons when no label provided', () => {
    renderWithProviders(
      <Button iconOnly>
        Close
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = renderWithProviders(
      <Button variant="secondary">Secondary</Button>
    );
    let button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('bg-secondary');

    rerender(
      <AccessibilityProvider>
        <Button variant="outline">Outline</Button>
      </AccessibilityProvider>
    );
    button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('border-input');

    rerender(
      <AccessibilityProvider>
        <Button variant="ghost">Ghost</Button>
      </AccessibilityProvider>
    );
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toHaveClass('hover:bg-accent');

    rerender(
      <AccessibilityProvider>
        <Button variant="link">Link</Button>
      </AccessibilityProvider>
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveClass('underline-offset-4');
  });

  it('renders different sizes', () => {
    const { rerender } = renderWithProviders(
      <Button size="sm">Small</Button>
    );
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button).toHaveClass('h-9');

    rerender(
      <AccessibilityProvider>
        <Button size="default">Default</Button>
      </AccessibilityProvider>
    );
    button = screen.getByRole('button', { name: 'Default' });
    expect(button).toHaveClass('h-10');

    rerender(
      <AccessibilityProvider>
        <Button size="lg">Large</Button>
      </AccessibilityProvider>
    );
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('h-11');

    rerender(
      <AccessibilityProvider>
        <Button size="icon">Icon</Button>
      </AccessibilityProvider>
    );
    button = screen.getByRole('button', { name: 'Icon' });
    expect(button).toHaveClass('w-10');
  });
});
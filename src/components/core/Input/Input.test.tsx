import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {ui}
    </AccessibilityProvider>
  );
};

describe('Input', () => {
  it('renders with default props', () => {
    renderWithProviders(<Input aria-label="test input" />);
    const input = screen.getByRole('textbox', { name: 'test input' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('h-10'); // default size
  });

  it('renders with label correctly', () => {
    renderWithProviders(<Input label="Username" />);
    const input = screen.getByRole('textbox', { name: 'Username' });
    const label = screen.getByText('Username');
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('handles required fields correctly', () => {
    renderWithProviders(<Input label="Username" required />);
    const input = screen.getByRole('textbox', { name: 'Username' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays help text correctly', () => {
    renderWithProviders(
      <Input label="Username" helpText="Must be at least 3 characters" />
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    const helpText = screen.getByText('Must be at least 3 characters');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(helpText.id));
  });

  it('handles error states correctly', () => {
    renderWithProviders(
      <Input label="Username" error="Username is required" />
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    const errorMessage = screen.getByRole('alert');
    
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorMessage.id));
    expect(errorMessage).toHaveTextContent('Username is required');
  });

  it('handles both help text and error message', () => {
    renderWithProviders(
      <Input
        label="Username"
        helpText="Must be at least 3 characters"
        error="Username is required"
      />
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    const errorMessage = screen.getByRole('alert');
    
    // Help text should not be visible when there's an error
    expect(screen.queryByText('Must be at least 3 characters')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
  });

  it('renders icons with proper accessibility attributes', () => {
    const StartIcon = () => <span>🔍</span>;
    const EndIcon = () => <span>✓</span>;

    renderWithProviders(
      <Input
        label="Search"
        startIcon={<StartIcon />}
        endIcon={<EndIcon />}
      />
    );

    const startIconContainer = screen.getByText('🔍').parentElement;
    const endIconContainer = screen.getByText('✓').parentElement;

    expect(startIconContainer).toHaveAttribute('aria-hidden', 'true');
    expect(endIconContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports hidden labels', () => {
    renderWithProviders(<Input label="Search" hideLabel />);
    const label = screen.getByText('Search');
    expect(label).toHaveClass('sr-only');
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(<Input label="Username" disabled />);
    const input = screen.getByRole('textbox', { name: 'Username' });
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('preserves custom aria-describedby', () => {
    renderWithProviders(
      <>
        <div id="custom-instructions">Custom instructions</div>
        <Input
          label="Username"
          aria-describedby="custom-instructions"
          helpText="Help text"
        />
      </>
    );
    
    const input = screen.getByRole('textbox', { name: 'Username' });
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('custom-instructions'));
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('-help'));
  });

  it('renders different variants', () => {
    const { rerender } = renderWithProviders(
      <Input variant="default" label="Default" />
    );
    expect(screen.getByRole('textbox')).toHaveClass('border-input');

    rerender(
      <AccessibilityProvider>
        <Input variant="error" label="Error" />
      </AccessibilityProvider>
    );
    expect(screen.getByRole('textbox')).toHaveClass('border-destructive');
  });

  it('renders different sizes', () => {
    const { rerender } = renderWithProviders(
      <Input size="sm" label="Small" />
    );
    expect(screen.getByRole('textbox')).toHaveClass('h-8');

    rerender(
      <AccessibilityProvider>
        <Input size="default" label="Default" />
      </AccessibilityProvider>
    );
    expect(screen.getByRole('textbox')).toHaveClass('h-10');

    rerender(
      <AccessibilityProvider>
        <Input size="lg" label="Large" />
      </AccessibilityProvider>
    );
    expect(screen.getByRole('textbox')).toHaveClass('h-12');
  });
});
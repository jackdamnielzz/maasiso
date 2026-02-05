import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      {ui}
    </AccessibilityProvider>
  );
};

describe('Card', () => {
  it('renders basic card with default props', () => {
    renderWithProviders(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders all card components with proper structure', () => {
    renderWithProviders(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('handles interactive card behavior', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <Card interactive onClick={handleClick}>
        <CardContent>Interactive Card</CardContent>
      </Card>
    );

    const card = screen.getByText('Interactive Card').parentElement!;
    expect(card).toHaveAttribute('role', 'article');
    expect(card).toHaveAttribute('tabIndex', '0');

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalled();

    // Test keyboard interaction
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('handles expandable card behavior', () => {
    const handleToggle = jest.fn();
    renderWithProviders(
      <Card expanded={false} onToggle={handleToggle}>
        <CardContent>Expandable Card</CardContent>
      </Card>
    );

    const card = screen.getByText('Expandable Card').parentElement!;
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(card);
    expect(handleToggle).toHaveBeenCalled();

    // Test keyboard interaction
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleToggle).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleToggle).toHaveBeenCalledTimes(3);
  });

  it('renders CardTitle with different heading levels', () => {
    const { rerender } = renderWithProviders(
      <CardTitle level={1}>Heading 1</CardTitle>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    rerender(
      <AccessibilityProvider>
        <CardTitle level={2}>Heading 2</CardTitle>
      </AccessibilityProvider>
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(
      <AccessibilityProvider>
        <CardTitle>Default Heading</CardTitle>
      </AccessibilityProvider>
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders CardContent with proper region role', () => {
    renderWithProviders(
      <CardContent>Region Content</CardContent>
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('applies proper focus styles for keyboard users', () => {
    renderWithProviders(
      <Card interactive>
        <CardContent>Interactive Card</CardContent>
      </Card>
    );

    const card = screen.getByText('Interactive Card').parentElement!;
    
    // Simulate keyboard navigation
    fireEvent.keyDown(document, { key: 'Tab' });
    card.focus();

    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('renders different variants', () => {
    const { rerender } = renderWithProviders(
      <Card variant="default">
        <CardContent>Default Card</CardContent>
      </Card>
    );
    expect(screen.getByText('Default Card').parentElement).toHaveClass('bg-background');

    rerender(
      <AccessibilityProvider>
        <Card variant="secondary">
          <CardContent>Secondary Card</CardContent>
        </Card>
      </AccessibilityProvider>
    );
    expect(screen.getByText('Secondary Card').parentElement).toHaveClass('bg-secondary/10');

    rerender(
      <AccessibilityProvider>
        <Card variant="outline">
          <CardContent>Outline Card</CardContent>
        </Card>
      </AccessibilityProvider>
    );
    expect(screen.getByText('Outline Card').parentElement).toHaveClass('border-2');
  });

  it('renders different sizes', () => {
    const { rerender } = renderWithProviders(
      <Card size="sm">
        <CardContent>Small Card</CardContent>
      </Card>
    );
    expect(screen.getByText('Small Card').parentElement).toHaveClass('p-4');

    rerender(
      <AccessibilityProvider>
        <Card size="default">
          <CardContent>Default Card</CardContent>
        </Card>
      </AccessibilityProvider>
    );
    expect(screen.getByText('Default Card').parentElement).toHaveClass('p-6');

    rerender(
      <AccessibilityProvider>
        <Card size="lg">
          <CardContent>Large Card</CardContent>
        </Card>
      </AccessibilityProvider>
    );
    expect(screen.getByText('Large Card').parentElement).toHaveClass('p-8');
  });
});

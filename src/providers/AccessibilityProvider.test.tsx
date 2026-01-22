import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';

// Test component that uses the accessibility context
function TestComponent() {
  const { isKeyboardUser, focusVisible, announceMessage } = useAccessibility();
  return (
    <div>
      <div data-testid="keyboard-status">
        {isKeyboardUser ? 'keyboard' : 'mouse'}
      </div>
      <div data-testid="focus-status">
        {focusVisible ? 'visible' : 'hidden'}
      </div>
      <button onClick={() => announceMessage('Test announcement')}>
        Announce
      </button>
      <button onClick={() => announceMessage('Urgent message', 'assertive')}>
        Urgent Announce
      </button>
    </div>
  );
}

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    // Reset body classes before each test
    document.body.className = '';
  });

  it('provides initial accessibility context values', () => {
    const { getByTestId } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(getByTestId('keyboard-status')).toHaveTextContent('mouse');
    expect(getByTestId('focus-status')).toHaveTextContent('hidden');
  });

  it('detects keyboard navigation', () => {
    const { getByTestId } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Simulate Tab key press using the triggerEvent helper
    act(() => {
      window.triggerEvent('keydown', { key: 'Tab' });
    });

    expect(getByTestId('keyboard-status')).toHaveTextContent('keyboard');
    expect(getByTestId('focus-status')).toHaveTextContent('visible');
    expect(document.body).toHaveClass('keyboard-user');
  });

  it('detects mouse interaction', () => {
    const { getByTestId } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // First enable keyboard navigation
    act(() => {
      window.triggerEvent('keydown', { key: 'Tab' });
    });
    expect(getByTestId('keyboard-status')).toHaveTextContent('keyboard');

    // Then simulate mouse interaction
    act(() => {
      window.triggerEvent('mousedown', {});
    });
    expect(getByTestId('keyboard-status')).toHaveTextContent('mouse');
    expect(getByTestId('focus-status')).toHaveTextContent('hidden');
    expect(document.body).not.toHaveClass('keyboard-user');
  });

  it('handles screen reader announcements', () => {
    const { getByRole, getByText } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Test polite announcement
    fireEvent.click(getByText('Announce'));
    const politeAnnouncement = getByRole('status');
    expect(politeAnnouncement).toHaveAttribute('aria-live', 'polite');
    expect(politeAnnouncement).toHaveTextContent('Test announcement');

    // Test assertive announcement
    fireEvent.click(getByText('Urgent Announce'));
    const assertiveAnnouncement = getByRole('status');
    expect(assertiveAnnouncement).toHaveAttribute('aria-live', 'assertive');
    expect(assertiveAnnouncement).toHaveTextContent('Urgent message');
  });

  it('clears announcements after delay', () => {
    jest.useFakeTimers();

    const { getByRole, getByText } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(getByText('Announce'));
    expect(getByRole('status')).toHaveTextContent('Test announcement');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(getByRole('status')).toHaveTextContent('');

    jest.useRealTimers();
  });

  it('throws error when useAccessibility is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be used within an AccessibilityProvider');

    consoleError.mockRestore();
  });

  it('properly cleans up event listeners', () => {
    const { unmount } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Mock addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
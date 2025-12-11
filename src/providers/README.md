# Providers

This directory contains React context providers that manage global application state and functionality.

## AccessibilityProvider

The AccessibilityProvider manages accessibility features across the application, including keyboard navigation, focus management, and screen reader announcements.

### Features

- Keyboard navigation detection
- Focus visibility management
- Screen reader announcements
- ARIA live regions
- Focus ring styling

### Usage

```tsx
// In your app root
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';

function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
    </AccessibilityProvider>
  );
}

// In your components
import { useAccessibility } from '@/providers/AccessibilityProvider';

function YourComponent() {
  const { isKeyboardUser, focusVisible, announceMessage } = useAccessibility();

  // Announce important changes
  const handleStatusChange = (status: string) => {
    announceMessage(`Status changed to: ${status}`, 'polite');
  };

  // Use keyboard navigation state
  const buttonClassName = isKeyboardUser ? 'show-focus-ring' : '';

  return (
    <button className={buttonClassName}>
      Click me
    </button>
  );
}
```

### API

#### AccessibilityProvider Props

| Prop     | Type            | Description                    |
|----------|-----------------|--------------------------------|
| children | React.ReactNode | The application components     |

#### useAccessibility Hook

Returns an object with:

| Property        | Type                                                    | Description                                |
|----------------|--------------------------------------------------------|--------------------------------------------|
| isKeyboardUser | boolean                                                 | Whether the user is navigating by keyboard |
| focusVisible   | boolean                                                 | Whether focus indicators should be visible |
| announceMessage| (message: string, priority?: 'polite' \| 'assertive') => void | Function to announce messages to screen readers |

### Features in Detail

#### Keyboard Navigation Detection

```tsx
function NavigationExample() {
  const { isKeyboardUser } = useAccessibility();

  useEffect(() => {
    if (isKeyboardUser) {
      console.log('User is navigating with keyboard');
    }
  }, [isKeyboardUser]);

  return <div>...</div>;
}
```

#### Screen Reader Announcements

```tsx
function FormExample() {
  const { announceMessage } = useAccessibility();

  const handleSubmit = async () => {
    try {
      await submitForm();
      announceMessage('Form submitted successfully', 'polite');
    } catch (error) {
      announceMessage('Error submitting form', 'assertive');
    }
  };

  return <form>...</form>;
}
```

#### Focus Management

```tsx
function DialogExample() {
  const { focusVisible } = useAccessibility();

  return (
    <div className={focusVisible ? 'focus-visible' : ''}>
      <button>Close</button>
    </div>
  );
}
```

### Best Practices

1. Screen Reader Announcements:
   - Use 'polite' for non-critical updates
   - Use 'assertive' for important alerts
   - Keep messages concise and clear

```tsx
// Good
announceMessage('3 items added to cart', 'polite');

// Bad - Too verbose
announceMessage('You have successfully added 3 items to your shopping cart and they are now ready for checkout when you want to proceed', 'polite');
```

2. Keyboard Navigation:
   - Don't disable focus styles
   - Maintain logical tab order
   - Provide keyboard shortcuts for common actions

```tsx
function KeyboardExample() {
  const { isKeyboardUser } = useAccessibility();

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Handle action
      }
    };

    if (isKeyboardUser) {
      window.addEventListener('keydown', handleKeyboard);
      return () => window.removeEventListener('keydown', handleKeyboard);
    }
  }, [isKeyboardUser]);

  return <div>...</div>;
}
```

3. Focus Visibility:
   - Always show focus indicators for keyboard users
   - Use high contrast colors for focus rings
   - Maintain consistent focus styles

```css
/* Included automatically by AccessibilityProvider */
.keyboard-user :focus {
  outline: 2px solid #FF8B00;
  outline-offset: 2px;
}
```

### Testing

The AccessibilityProvider includes comprehensive tests covering:
- Keyboard navigation detection
- Focus management
- Screen reader announcements
- Component integration

Run tests with:
```bash
npm test src/providers/AccessibilityProvider.test.tsx
```

### Accessibility Guidelines

When using the AccessibilityProvider, ensure your components:

1. Use semantic HTML elements
2. Include proper ARIA attributes
3. Maintain keyboard navigation
4. Provide meaningful announcements
5. Handle focus management appropriately

Example of combining all features:

```tsx
function AccessibleComponent() {
  const { isKeyboardUser, focusVisible, announceMessage } = useAccessibility();

  const handleAction = () => {
    // Perform action
    announceMessage('Action completed', 'polite');
  };

  return (
    <div
      role="region"
      aria-label="Accessible Component"
      className={focusVisible ? 'focus-visible' : ''}
    >
      <button
        onClick={handleAction}
        onKeyDown={(e) => e.key === 'Enter' && handleAction()}
        className={isKeyboardUser ? 'keyboard-focus' : ''}
      >
        Perform Action
      </button>
    </div>
  );
}
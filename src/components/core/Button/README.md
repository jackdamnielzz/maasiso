# Button Component

A flexible and accessible button component that supports various styles, sizes, and states.

## Usage

```tsx
import Button from '@/components/core/Button';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>
<Button pressed>Pressed</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' | 'primary' | The visual style of the button |
| size | 'sm' \| 'default' \| 'lg' \| 'icon' | 'default' | The size of the button |
| loading | boolean | false | Shows a loading spinner and disables the button |
| pressed | boolean | undefined | Indicates if the button is pressed (for toggle buttons) |
| iconOnly | boolean | false | Indicates if the button only contains an icon |
| disabled | boolean | false | Disables the button |
| className | string | undefined | Additional CSS classes |
| children | ReactNode | required | The content of the button |

## Accessibility Features

### ARIA Attributes

- `aria-disabled`: Automatically set when the button is disabled or loading
- `aria-busy`: Set to true when in loading state
- `aria-pressed`: Used for toggle buttons to indicate pressed state
- `aria-label`: Required for icon-only buttons, automatically uses text content if not provided
- `role`: Automatically set to:
  - "link" for link variant
  - "switch" for toggle buttons (when pressed prop is provided)
  - "button" for all other variants

### Keyboard Interaction

- Fully keyboard accessible with enhanced focus styles for keyboard users
- Focus ring appears only when navigating with keyboard (via AccessibilityProvider)
- Enter/Space triggers the button action
- Tab moves focus to the next focusable element

### Screen Reader Support

- Loading state announced via "Loading" text
- Icon-only buttons require an aria-label or text content for screen reader users
- Role announcements help users understand button type (button, link, or switch)
- Disabled state properly announced

### Loading State

When in loading state:
- Button is disabled to prevent multiple submissions
- Loading spinner is shown with "Loading" text for screen readers
- Original content is hidden but preserved for after loading
- Cursor changes to 'wait' to indicate loading

### Icon Button Accessibility

Icon-only buttons require special attention for accessibility:
```tsx
// Good - with aria-label
<Button iconOnly aria-label="Close dialog">
  <CloseIcon />
</Button>

// Good - with text content
<Button iconOnly>
  Close
</Button>

// Bad - no accessible name
<Button iconOnly>
  <CloseIcon />
</Button>
```

## Integration with AccessibilityProvider

The Button component integrates with the AccessibilityProvider to:
- Show focus styles only when using keyboard navigation
- Maintain consistent focus management across the application
- Ensure proper ARIA attribute handling

## Best Practices

1. Always provide an accessible name:
   - Use clear text content for text buttons
   - Use aria-label for icon-only buttons

2. Use appropriate variants:
   - Primary for main actions
   - Secondary for alternative actions
   - Link for navigation-like actions

3. Handle loading states:
   - Show loading state during async operations
   - Disable the button while loading
   - Provide feedback via the loading spinner

4. Toggle buttons:
   - Use the pressed prop for toggle functionality
   - Ensure the pressed state is visually clear
   - Maintain ARIA attribute consistency

5. Icon buttons:
   - Always include an aria-label or text content
   - Use the iconOnly prop to ensure proper styling
   - Consider adding tooltips for additional context
# Input Component

An accessible and flexible input component that supports various styles, states, and helper elements.

## Usage

```tsx
import Input from '@/components/core/Input';

// Basic usage with label
<Input label="Username" />

// Required field
<Input 
  label="Email" 
  required 
  type="email" 
/>

// With help text
<Input
  label="Password"
  type="password"
  helpText="Must be at least 8 characters"
/>

// With error message
<Input
  label="Username"
  error="Username is already taken"
/>

// With icons
<Input
  label="Search"
  startIcon={<SearchIcon />}
  endIcon={<ClearIcon />}
/>

// Visually hidden label
<Input
  label="Search"
  hideLabel
  placeholder="Search..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'error' | 'default' | The visual style of the input |
| size | 'sm' \| 'default' \| 'lg' | 'default' | The size of the input |
| error | boolean \| string | undefined | Error state or message |
| startIcon | ReactNode | undefined | Icon to display at the start of the input |
| endIcon | ReactNode | undefined | Icon to display at the end of the input |
| label | string | undefined | Label text for the input |
| helpText | string | undefined | Help text displayed below the input |
| required | boolean | false | Whether the input is required |
| hideLabel | boolean | false | Visually hide the label while keeping it accessible |
| className | string | undefined | Additional CSS classes |

## Accessibility Features

### Labels and Form Association

- Every input must have an associated label
- Labels are properly associated using htmlFor/id pairs
- Visual labels can be hidden while maintaining accessibility
- Required fields are marked with both visual and programmatic indicators

```tsx
// Visible label
<Input label="Username" required />

// Hidden label
<Input label="Search" hideLabel />
```

### Error States and Messages

- Error messages are announced to screen readers using role="alert"
- Inputs in error state have aria-invalid="true"
- Error messages are associated with inputs using aria-describedby
- Error styling provides visual indication of invalid state

```tsx
<Input
  label="Email"
  error="Please enter a valid email address"
/>
```

### Help Text

- Help text is associated with inputs using aria-describedby
- Help text is hidden when error messages are present to avoid confusion
- Multiple descriptions (help text, error messages) are properly combined

```tsx
<Input
  label="Password"
  helpText="Must contain at least 8 characters"
  aria-describedby="custom-instructions" // Additional descriptions
/>
```

### Icon Accessibility

- Decorative icons are hidden from screen readers using aria-hidden
- Icons that convey meaning include proper aria-label
- Icons maintain proper contrast ratios
- Click targets are appropriately sized

```tsx
<Input
  label="Search"
  startIcon={<SearchIcon aria-hidden="true" />}
  endIcon={
    <button aria-label="Clear search">
      <ClearIcon />
    </button>
  }
/>
```

### Keyboard Interaction

- Full keyboard navigation support
- Focus indicators are clearly visible
- Focus styles are enhanced for keyboard users via AccessibilityProvider
- Tab order follows logical document flow

### Screen Reader Considerations

- Proper ARIA attributes for various states (required, invalid, disabled)
- Clear error message announcements
- Status changes are announced appropriately
- Input purpose is clearly conveyed

## Best Practices

1. Labels
   - Always provide a label
   - Use clear, concise label text
   - Consider using hideLabel only when context makes the purpose clear

2. Error Messages
   - Be specific about what's wrong
   - Provide guidance on how to fix the error
   - Use proper error message association

3. Help Text
   - Provide when input requirements need clarification
   - Keep help text concise and clear
   - Consider progressive disclosure for complex requirements

4. Icons
   - Use icons consistently across the application
   - Ensure icons have proper accessibility treatment
   - Consider interactive icons carefully

5. Required Fields
   - Clearly indicate required state
   - Use both visual and programmatic indicators
   - Consider marking optional fields instead if most fields are required

6. Validation
   - Validate in real-time when appropriate
   - Provide clear error messages
   - Consider using aria-live for dynamic validation messages

## Integration with AccessibilityProvider

The Input component integrates with the AccessibilityProvider to:
- Enhance focus styles for keyboard users
- Maintain consistent focus management
- Ensure proper ARIA attribute handling

## Examples

### Form Field with Validation

```tsx
<Input
  label="Email"
  type="email"
  required
  helpText="We'll never share your email"
  error={emailError}
  startIcon={<EmailIcon />}
  endIcon={isValid ? <CheckIcon /> : undefined}
/>
```

### Search Field with Hidden Label

```tsx
<Input
  label="Search products"
  hideLabel
  placeholder="Search..."
  startIcon={<SearchIcon />}
  endIcon={
    <button aria-label="Clear search">
      <ClearIcon />
    </button>
  }
/>
```

### Password Field with Requirements

```tsx
<Input
  label="Password"
  type="password"
  required
  helpText="Must be at least 8 characters with one number"
  startIcon={<LockIcon />}
  endIcon={
    <button
      type="button"
      onClick={toggleVisibility}
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      {isVisible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  }
/>
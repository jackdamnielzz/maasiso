# Card Component

A flexible and accessible card component that supports various styles, interactions, and content structures.

## Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/core/Card';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>

// Interactive card (e.g., clickable card)
<Card interactive onClick={() => handleCardClick()}>
  <CardContent>
    Click me!
  </CardContent>
</Card>

// Expandable card
<Card 
  expanded={isExpanded}
  onToggle={() => setIsExpanded(!isExpanded)}
>
  <CardContent>
    Expandable content
  </CardContent>
</Card>

// Custom heading level
<CardTitle level={2}>Section Title</CardTitle>
```

## Props

### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'secondary' \| 'outline' | 'default' | The visual style of the card |
| size | 'sm' \| 'default' \| 'lg' | 'default' | The size of the card |
| hover | 'default' \| 'none' | 'default' | Hover effect style |
| interactive | boolean | false | Makes the card clickable |
| expanded | boolean | undefined | Controls expandable state |
| onToggle | () => void | undefined | Callback for expandable cards |
| className | string | undefined | Additional CSS classes |

### CardTitle Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| level | 1 \| 2 \| 3 \| 4 \| 5 \| 6 | 3 | Heading level for the title |
| className | string | undefined | Additional CSS classes |

## Accessibility Features

### Interactive Cards

Interactive cards provide proper keyboard and screen reader support:

```tsx
// Clickable card
<Card interactive onClick={handleClick}>
  <CardContent>
    This entire card is clickable
  </CardContent>
</Card>
```

- Automatically receives `role="article"`
- Focusable with `tabIndex={0}`
- Keyboard support for Enter and Space
- Visual focus indicator for keyboard users
- Proper cursor styles

### Expandable Cards

Expandable cards follow accordion pattern best practices:

```tsx
<Card
  expanded={isExpanded}
  onToggle={() => setIsExpanded(!isExpanded)}
>
  <CardHeader>
    <CardTitle>Expandable Section</CardTitle>
  </CardHeader>
  <CardContent>
    Content that can be shown/hidden
  </CardContent>
</Card>
```

- Automatically receives `role="button"`
- Proper `aria-expanded` state
- Keyboard support for Enter and Space
- Focus management on expand/collapse

### Semantic Structure

The Card components create a proper document outline:

```tsx
<Card>
  <CardHeader>
    <CardTitle level={2}>Section Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardContent>Main content</CardContent>
</Card>
```

- Proper heading hierarchy with configurable levels
- Region landmarks for content sections
- Descriptive text properly associated

### Focus Management

Focus handling is integrated with AccessibilityProvider:

- Enhanced focus styles for keyboard users
- Focus ring only shows during keyboard navigation
- Proper focus order in complex card layouts
- Focus trapped appropriately in modal cards

### ARIA Attributes

Cards automatically manage appropriate ARIA attributes:

- `role="article"` for interactive cards
- `role="button"` for expandable cards
- `role="region"` for card content sections
- `aria-expanded` for expandable state
- `aria-controls` for content relationships

## Best Practices

1. Heading Structure
   ```tsx
   // Good - proper heading hierarchy
   <main>
     <h1>Page Title</h1>
     <Card>
       <CardTitle level={2}>Card Title</CardTitle>
     </Card>
   </main>

   // Bad - skipping levels
   <main>
     <h1>Page Title</h1>
     <Card>
       <CardTitle level={4}>Card Title</CardTitle>
     </Card>
   </main>
   ```

2. Interactive Content
   ```tsx
   // Good - clear interaction purpose
   <Card interactive onClick={viewDetails}>
     <CardHeader>
       <CardTitle>Product Name</CardTitle>
       <CardDescription>Click to view details</CardDescription>
     </CardHeader>
   </Card>

   // Bad - unclear interaction
   <Card interactive onClick={handleClick}>
     <CardContent>
       Some content
     </CardContent>
   </Card>
   ```

3. Expandable Content
   ```tsx
   // Good - clear expansion state
   <Card
     expanded={isExpanded}
     onToggle={toggle}
   >
     <CardHeader>
       <CardTitle>
         {isExpanded ? 'Collapse Details' : 'Show Details'}
       </CardTitle>
     </CardHeader>
   </Card>

   // Bad - no visual indication
   <Card
     expanded={isExpanded}
     onToggle={toggle}
   >
     <CardTitle>Details</CardTitle>
   </Card>
   ```

4. Content Structure
   ```tsx
   // Good - logical structure
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
       <CardDescription>Description</CardDescription>
     </CardHeader>
     <CardContent>
       <p>Main content</p>
     </CardContent>
     <CardFooter>
       <Button>Action</Button>
     </CardFooter>
   </Card>

   // Bad - missing semantic structure
   <Card>
     <div>Title</div>
     <div>Content</div>
     <div>
       <Button>Action</Button>
     </div>
   </Card>
   ```

## Integration with AccessibilityProvider

The Card component integrates with AccessibilityProvider to:
- Enhance focus styles for keyboard users
- Maintain consistent focus management
- Ensure proper ARIA attribute handling

## Examples

### Product Card

```tsx
<Card interactive onClick={viewProduct}>
  <CardHeader>
    <CardTitle level={3}>Product Name</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Product details</p>
    <p>Price: $99.99</p>
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>
```

### Expandable FAQ Card

```tsx
<Card
  expanded={isExpanded}
  onToggle={() => setIsExpanded(!isExpanded)}
>
  <CardHeader>
    <CardTitle level={3}>
      Frequently Asked Question
      <span aria-hidden="true">
        {isExpanded ? ' ▼' : ' ▶'}
      </span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    {isExpanded && (
      <p>Answer to the question...</p>
    )}
  </CardContent>
</Card>
# Typography Component

An accessible and flexible typography component that supports various text styles, semantic elements, and accessibility features.

## Usage

```tsx
import Typography from '@/components/core/Typography';

// Basic usage
<Typography>Regular text</Typography>

// Headings with proper semantic level
<Typography variant="h1">Main Title</Typography>
<Typography variant="h2" level={3}>Section Title as h3</Typography>

// Text emphasis
<Typography emphasis="strong">Important text</Typography>
<Typography emphasis="em">Emphasized text</Typography>
<Typography emphasis="mark">Highlighted text</Typography>

// Screen reader only text
<Typography visuallyHidden>For screen readers only</Typography>

// Internationalization
<Typography lang="es" dir="ltr">¡Hola Mundo!</Typography>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'p' \| 'blockquote' \| 'list' \| 'lead' \| 'large' \| 'small' \| 'muted' \| 'srOnly' | 'p' | The visual and semantic style |
| align | 'left' \| 'center' \| 'right' | 'left' | Text alignment |
| emphasis | 'normal' \| 'strong' \| 'em' \| 'mark' | 'normal' | Text emphasis style |
| as | ElementType | undefined | Override the rendered element |
| level | 1 \| 2 \| 3 \| 4 \| 5 \| 6 | undefined | Heading level for semantic structure |
| lang | string | undefined | Language code (e.g., 'en', 'es') |
| dir | 'ltr' \| 'rtl' | undefined | Text direction |
| visuallyHidden | boolean | false | Hide text visually but keep it accessible |
| className | string | undefined | Additional CSS classes |

## Accessibility Features

### Semantic Structure

Typography components maintain proper document structure:

```tsx
// Good - proper heading hierarchy
<main>
  <Typography variant="h1">Page Title</Typography>
  <section>
    <Typography variant="h2">Section Title</Typography>
    <Typography variant="h3">Subsection Title</Typography>
  </section>
</main>

// Better - explicit heading levels
<main>
  <Typography variant="h2" level={1}>Page Title</Typography>
  <section>
    <Typography variant="h3" level={2}>Section Title</Typography>
  </section>
</main>
```

### Screen Reader Support

Support for screen readers and assistive technologies:

```tsx
// Visually hidden text
<Typography visuallyHidden>
  Additional context for screen readers
</Typography>

// Or using the srOnly variant
<Typography variant="srOnly">
  Skip to main content
</Typography>

// ARIA labels
<Typography aria-label="Last updated">
  2 hours ago
</Typography>
```

### Internationalization

Support for different languages and text directions:

```tsx
// Right-to-left text
<Typography lang="ar" dir="rtl">
  مرحبا بالعالم
</Typography>

// Language-specific content
<Typography lang="fr">
  Bonjour le monde
</Typography>
```

### Text Emphasis

Semantic emphasis with proper markup:

```tsx
// Strong importance
<Typography emphasis="strong">
  Warning: This action cannot be undone
</Typography>

// Stressed emphasis
<Typography emphasis="em">
  Please review carefully
</Typography>

// Highlighted text
<Typography emphasis="mark">
  Search result match
</Typography>
```

### ARIA Roles

Appropriate ARIA roles for different content types:

```tsx
// Blockquote with citation
<Typography variant="blockquote">
  Famous quote
  <Typography variant="small" emphasis="em">
    - Author Name
  </Typography>
</Typography>

// List content
<Typography variant="list">
  List content
</Typography>

// Introduction text
<Typography variant="lead" role="doc-introduction">
  Article introduction
</Typography>
```

## Best Practices

1. Heading Structure
   - Maintain a logical heading hierarchy (h1 → h2 → h3)
   - Use the level prop to ensure semantic correctness
   - Don't skip heading levels

```tsx
// Good
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2">Section</Typography>
<Typography variant="h3">Subsection</Typography>

// Bad - skipping levels
<Typography variant="h1">Page Title</Typography>
<Typography variant="h3">Subsection</Typography>
```

2. Screen Reader Text
   - Use visuallyHidden for additional context
   - Keep hidden text concise and meaningful
   - Don't hide essential content

```tsx
// Good
<button>
  <Icon name="delete" />
  <Typography visuallyHidden>Delete item</Typography>
</button>

// Bad - essential content hidden
<Typography visuallyHidden>Important warning message</Typography>
```

3. Language and Direction
   - Always specify lang for non-default language content
   - Use dir for right-to-left text
   - Consider text expansion in translations

```tsx
// Good
<Typography lang="ja">こんにちは</Typography>

// Better
<Typography lang="ja" dir="ltr">
  こんにちは
</Typography>
```

4. Text Emphasis
   - Use semantic emphasis elements
   - Choose appropriate emphasis type
   - Don't overuse emphasis

```tsx
// Good - semantic importance
<Typography emphasis="strong">Critical warning</Typography>

// Good - stressed emphasis
<Typography emphasis="em">Key point</Typography>

// Bad - overuse
<Typography emphasis="strong">
  <Typography emphasis="em">Overly emphasized</Typography>
</Typography>
```

## Examples

### Article Content

```tsx
<article>
  <Typography variant="h1">Article Title</Typography>
  <Typography variant="lead" role="doc-introduction">
    Article introduction text
  </Typography>
  
  <Typography variant="h2">First Section</Typography>
  <Typography>
    Regular paragraph text with{' '}
    <Typography as="span" emphasis="em">emphasized</Typography>
    {' '}content.
  </Typography>
  
  <Typography variant="blockquote">
    Important quote
    <Typography variant="small" emphasis="em">
      - Source
    </Typography>
  </Typography>
</article>
```

### Form Labels

```tsx
<form>
  <Typography as="label" htmlFor="email">
    Email Address
    <Typography variant="small" emphasis="em">
      (Required)
    </Typography>
  </Typography>
  <input id="email" type="email" required />
  
  <Typography variant="small" className="text-muted">
    We'll never share your email
  </Typography>
</form>
```

### Internationalized Content

```tsx
<div>
  <Typography lang="en">Hello World</Typography>
  <Typography lang="es" dir="ltr">¡Hola Mundo!</Typography>
  <Typography lang="ar" dir="rtl">مرحبا بالعالم</Typography>
  <Typography lang="he" dir="rtl">שלום עולם</Typography>
</div>
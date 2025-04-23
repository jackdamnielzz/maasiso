# OptimizedImage Component

An accessible and optimized image component that supports various loading states, error handling, and screen reader announcements.

## Usage

```tsx
import OptimizedImage from '@/components/core/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Descriptive text"
  width={800}
  height={600}
/>

// With caption
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Descriptive text"
  caption="Image caption or credit"
  width={800}
  height={600}
/>

// Decorative image
<OptimizedImage
  src="/path/to/icon.svg"
  alt="Descriptive text"
  decorative
  width={24}
  height={24}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string | required | Image source URL |
| alt | string | required | Alternative text description |
| width | number | required | Image width |
| height | number | required | Image height |
| caption | string | undefined | Optional caption text |
| decorative | boolean | false | Mark image as decorative |
| fallback | string | '/placeholder-blog.jpg' | Fallback image source |
| loadingText | string | 'Image is loading' | Loading announcement text |
| errorText | string | 'Failed to load image' | Error announcement text |
| wrapperClassName | string | undefined | Additional wrapper classes |
| className | string | undefined | Additional image classes |

## Accessibility Features

### Alternative Text

The component enforces proper alt text usage:

```tsx
// Good - descriptive alt text
<OptimizedImage
  src="/product.jpg"
  alt="Red ceramic coffee mug with floral pattern"
  width={400}
  height={300}
/>

// Good - decorative image
<OptimizedImage
  src="/divider.svg"
  alt="Decorative divider"
  decorative
  width={100}
  height={2}
/>

// Bad - non-descriptive alt text
<OptimizedImage
  src="/product.jpg"
  alt="Product image"
  width={400}
  height={300}
/>
```

### Loading States

Loading states are properly announced to screen readers:

```tsx
<OptimizedImage
  src="/large-image.jpg"
  alt="Conference presentation"
  width={1200}
  height={800}
  loadingText="Loading conference presentation image"
/>
```

Features:
- Visual loading indicator
- ARIA live region announcements
- Proper loading state classes
- Custom loading text support

### Error Handling

Error states are handled gracefully:

```tsx
<OptimizedImage
  src="/might-fail.jpg"
  alt="User profile"
  fallback="/default-avatar.jpg"
  errorText="Unable to load profile picture"
  width={200}
  height={200}
/>
```

Features:
- Automatic fallback image
- Error announcements
- Visual error state
- Custom error messages

### Figure and Caption

Support for semantic figure and caption elements:

```tsx
<OptimizedImage
  src="/chart.png"
  alt="Bar chart showing sales data for Q1 2025"
  caption="Sales performance by region, Q1 2025"
  width={800}
  height={400}
/>
```

Features:
- Semantic HTML structure
- Proper figure/figcaption relationship
- Accessible caption text

### Decorative Images

Support for properly handling decorative images:

```tsx
<OptimizedImage
  src="/background-pattern.svg"
  alt="Decorative background pattern"
  decorative
  width={500}
  height={500}
/>
```

Features:
- Empty alt text
- aria-hidden attribute
- Proper semantic meaning

## Best Practices

1. Alternative Text
   ```tsx
   // Good - specific and descriptive
   <OptimizedImage
     src="/team.jpg"
     alt="Development team collaborating at whiteboard"
     width={800}
     height={600}
   />

   // Good - empty alt for decorative
   <OptimizedImage
     src="/divider.svg"
     alt="Decorative line"
     decorative
     width={100}
     height={2}
   />

   // Bad - redundant or non-descriptive
   <OptimizedImage
     src="/photo.jpg"
     alt="Image"
     width={800}
     height={600}
   />
   ```

2. Loading States
   ```tsx
   // Good - informative loading text
   <OptimizedImage
     src="/report.pdf"
     alt="Annual report chart"
     loadingText="Loading annual report visualization"
     width={1000}
     height={800}
   />

   // Bad - generic loading text
   <OptimizedImage
     src="/report.pdf"
     alt="Annual report chart"
     loadingText="Loading..."
     width={1000}
     height={800}
   />
   ```

3. Error Handling
   ```tsx
   // Good - helpful error message
   <OptimizedImage
     src="/profile.jpg"
     alt="User profile picture"
     errorText="Unable to load profile picture. Using default avatar."
     fallback="/default-avatar.jpg"
     width={200}
     height={200}
   />

   // Bad - unhelpful error message
   <OptimizedImage
     src="/profile.jpg"
     alt="User profile picture"
     errorText="Error"
     width={200}
     height={200}
   />
   ```

4. Captions
   ```tsx
   // Good - informative caption
   <OptimizedImage
     src="/data-viz.png"
     alt="Line graph showing user growth from 2020 to 2025"
     caption="User growth increased by 200% between 2020 and 2025"
     width={800}
     height={400}
   />

   // Bad - redundant caption
   <OptimizedImage
     src="/data-viz.png"
     alt="Line graph showing user growth"
     caption="Line graph showing user growth"
     width={800}
     height={400}
   />
   ```

## Examples

### Profile Picture with Fallback

```tsx
<OptimizedImage
  src={user.avatarUrl}
  alt={`Profile picture of ${user.name}`}
  fallback="/default-avatar.jpg"
  errorText={`Unable to load ${user.name}'s profile picture`}
  width={64}
  height={64}
  className="rounded-full"
/>
```

### Article Hero Image

```tsx
<OptimizedImage
  src={article.heroImage}
  alt={article.imageDescription}
  caption={`Photo by ${article.imageCredit}`}
  width={1200}
  height={600}
  priority // Load immediately
  loadingText="Loading article hero image"
  className="rounded-lg"
/>
```

### Decorative Background Pattern

```tsx
<OptimizedImage
  src="/patterns/dots.svg"
  alt="Decorative dot pattern"
  decorative
  width={500}
  height={500}
  className="absolute -z-10 opacity-10"
/>
```

### Chart with Caption

```tsx
<OptimizedImage
  src="/charts/revenue.png"
  alt="Bar chart showing monthly revenue for 2025, with peak in July at $1.2M"
  caption="Monthly Revenue 2025 - Peak revenue achieved in July"
  width={1000}
  height={500}
  loadingText="Loading revenue chart visualization"
  className="border rounded p-4"
/>
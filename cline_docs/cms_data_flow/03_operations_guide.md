# Quick Reference: Common CMS Operations

## Fetching Pages

```typescript
// Get a page by slug
const page = await getPage('page-slug');

// Page includes:
// - Layout components
// - SEO metadata
// - Dynamic content
```

## Fetching Blog Posts

```typescript
// Get a single post
const post = await getBlogPostBySlug('post-slug');

// Get a list of posts
const posts = await getBlogPosts(page, pageSize, categorySlug);

// Get related posts
const related = await getRelatedPosts(currentSlug, categoryIds);
```

## Navigation

```typescript
// Get all menus
const menus = await getAllMenus();

// Get menu by handle
const menu = await getMenuByHandle('main-menu');

// Get menus by type
const footerMenus = await getMenusByType('footer');
```

## Data Validation

```typescript
// Check if data matches blog post structure
if (isStrapiRawBlogPost(data)) {
  return normalizeBlogPost(data);
}

// Check if data matches page structure
if (hasRequiredAttributes(data, ['title', 'slug', 'layout'])) {
  return normalizePage(data);
}
```

## Error Handling

```typescript
try {
  const page = await getPage(slug);
} catch (error) {
  if (error instanceof Error && error.message.includes('404')) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Common Issues & Solutions

### 404 Not Found
- Check slug format matches CMS
- Verify content is published
- Check API endpoint configuration

### Authentication Errors
- Verify NEXT_PUBLIC_STRAPI_TOKEN in .env.local
- Check token permissions in CMS
- Ensure token is not expired

### Data Validation Errors
- Check CMS field types match expected types
- Verify required fields are present
- Handle nullable fields properly

## API Endpoints

### Pages
```
GET /api/pages?filters[slug][$eq]=<slug>&populate[layout][populate]=*
```

### Blog Posts
```
GET /api/blog-posts?filters[slug][$eq]=<slug>&populate=*
```

### Navigation
```
GET /api/menus?populate[items][populate]=*
```

## Environment Configuration

Required variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://your-cms-url/api
NEXT_PUBLIC_STRAPI_TOKEN=your-api-token
```

## Component Types

```typescript
type PageComponentType = 'hero' | 'text' | 'gallery' | 'features';

interface PageComponent {
  id: string;
  __component: PageComponentType;
  // ... component-specific fields
}
```

## Testing

```typescript
// Test page fetching
const page = await getPage('test-page');
expect(page).toHaveProperty('layout');

// Test data normalization
const normalized = normalizePage(rawData);
expect(normalized).toMatchSchema(PageSchema);

# Technical Guide

## Project Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── blog/              # Blog-related pages
│   │   ├── news/              # News-related pages
│   │   └── search/            # Search functionality
│   ├── components/            # React components
│   │   ├── common/           # Shared components
│   │   ├── features/         # Feature-specific components
│   │   └── layout/           # Layout components
│   └── lib/                  # Core utilities
│       ├── api.ts            # API integration
│       ├── types.ts          # TypeScript definitions
│       ├── normalizers.ts    # Data normalization
│       ├── cache.ts          # Caching utilities
│       ├── utils.ts          # Shared utilities
│       └── retry.ts          # Retry mechanism
```

## Core Concepts

### 1. Type Safety
The project uses TypeScript with strict type checking. Key patterns include:

#### Type Guards
```typescript
function isStrapiRawBlogPost(data: any): data is StrapiRawBlogPost {
  return data && 
    typeof data === 'object' && 
    'id' in data && 
    'attributes' in data &&
    typeof data.attributes === 'object' &&
    'title' in data.attributes &&
    ('Content' in data.attributes || 'content' in data.attributes);
}
```

#### Data Normalization
```typescript
function normalizeBlogPost(raw: StrapiRawBlogPost): BlogPost {
  return {
    id: raw.id,
    title: raw.attributes.title,
    content: raw.attributes.Content || raw.attributes.content || '',
    // ... other fields
  };
}
```

### 2. Error Handling

#### Error Boundaries
- Page-level error boundaries in error.tsx files
- Component-level boundaries for specific features
- Consistent error UI with retry functionality

#### API Error Handling
```typescript
try {
  const response = await fetchWithRetry(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
} catch (error) {
  return handleApiError(error, 'Operation failed');
}
```

### 3. Caching Strategy

#### Static Content
- Individual blog posts and news articles
- 1-hour revalidation period
- Cache tags for invalidation

```typescript
const options = getStaticFetchOptions('blogPost');
const response = await fetchWithRetry(url, options);
```

#### List Pages
- Blog and news listings
- 30-minute revalidation
- Category-based cache tags

```typescript
const options = getListFetchOptions('category');
const response = await fetchWithRetry(url, options);
```

#### Dynamic Content
- Search functionality
- No caching
```typescript
const options = getDynamicFetchOptions();
const response = await fetchWithRetry(url, options);
```

### 4. Component Patterns

#### Feature Components
- Self-contained with own types and logic
- Clear props interface
- Error handling included
- Loading states handled

Example:
```typescript
interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const displayDate = post.publishedAt || post.createdAt;
  const mainCategory = post.categories[0];

  return (
    // Component JSX
  );
}
```

#### Common Components
- Reusable across features
- Generic and configurable
- Well-documented props
- Accessibility considered

Example:
```typescript
interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  defaultLabel?: string;
}
```

### 5. Data Flow

#### API Layer
1. Request with retry mechanism
2. Response validation
3. Data normalization
4. Type-safe return

```typescript
async function getBlogPosts(): Promise<PaginatedBlogPosts> {
  const response = await fetchWithRetry(url, options);
  const data = await response.json();
  validateResponse(data);
  return normalizeResponse(data);
}
```

#### Component Layer
1. Data fetching in page components
2. Props passing to feature components
3. Error handling at boundaries
4. Loading states managed

## Best Practices

### 1. Code Organization
- Keep components focused and single-purpose
- Use consistent file naming
- Group related functionality
- Maintain clear separation of concerns

### 2. Performance
- Implement appropriate caching
- Use Next.js Image optimization
- Lazy load where appropriate
- Monitor bundle size

### 3. Error Handling
- Use error boundaries strategically
- Provide helpful error messages
- Implement retry mechanisms
- Log errors appropriately

### 4. Type Safety
- Define clear interfaces
- Use type guards for validation
- Avoid type assertions
- Maintain type documentation

### 5. Testing
- Write unit tests for utilities
- Test error scenarios
- Verify type safety
- Test component rendering

## Common Tasks

### Adding a New Feature
1. Define types in types.ts
2. Create API functions in api.ts
3. Implement data normalization
4. Create feature components
5. Add page components
6. Implement error handling
7. Add documentation

### Modifying Existing Features
1. Review existing types
2. Update API functions if needed
3. Modify components
4. Update tests
5. Update documentation

### Handling API Changes
1. Update types.ts
2. Modify normalizers
3. Update API functions
4. Test changes
5. Update documentation

## Troubleshooting

### Common Issues
1. Type errors
   - Check interface definitions
   - Verify API response structure
   - Use type guards appropriately

2. Caching issues
   - Verify cache configuration
   - Check revalidation periods
   - Use appropriate cache tags

3. Performance issues
   - Review caching strategy
   - Check image optimization
   - Monitor API response times

### Development Tools
- VSCode with TypeScript
- Chrome DevTools
- React DevTools
- Network monitoring

## Additional Resources
- [API Documentation](api_documentation.md)
- [Type System Documentation](technical_issues/type_system_audit.md)
- [Strapi Field Mapping](technical_issues/strapi_field_mapping_solution.md)

Last Updated: 2025-01-20

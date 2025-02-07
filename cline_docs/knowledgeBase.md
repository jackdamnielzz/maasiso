# Knowledge Base

## Design Decisions

### Client-Side Prefetching Components
- **Decision:** Created separate client components for prefetching functionality
- **Rationale:** 
  - Separates server and client concerns in Next.js app
  - Prevents "Event handlers cannot be passed to Client Component props" errors
  - Makes prefetching logic more maintainable and reusable
- **Implementation:**
  - PrefetchingCategoryFilter: Handles category hover prefetching
  - PrefetchingPagination: Handles pagination hover prefetching
  - Both components wrap their respective UI components and handle prefetching internally

### Data Structure Handling
- **Decision:** Updated types and validation for flat Strapi response structure
- **Rationale:**
  - API returns flat structure instead of nested attributes
  - Need to handle both formats for backward compatibility
- **Implementation:**
  - Updated StrapiRawBlogPost interface
  - Modified validation functions
  - Added type guards for proper TypeScript support

## Common Issues and Solutions

### Next.js Server/Client Component Issues
- **Issue:** Event handlers cannot be passed to Server Components
- **Solution:** Create separate client components that handle events internally
- **Prevention:** 
  - Keep event handling in client components
  - Pass only data props from server components
  - Use wrapper components for complex interactions

### API Integration
- **Issue:** Mismatched data structures between API and frontend
- **Solution:** 
  - Update type definitions to match actual API response
  - Add proper validation
  - Include detailed error logging
- **Prevention:**
  - Validate API responses early
  - Keep type definitions in sync with API changes
  - Document data structure changes

## Best Practices

### Component Structure
- Separate client and server concerns
- Create wrapper components for complex client-side functionality
- Keep server components focused on data fetching and rendering

### Type Safety
- Define clear interfaces for API responses
- Use type guards for runtime validation
- Include detailed error messages for debugging

### Performance
- Implement prefetching for better user experience
- Handle prefetch errors gracefully
- Log performance metrics for monitoring

## Recent Changes
- [2025-01-25] Created PrefetchingCategoryFilter and PrefetchingPagination components
- [2025-01-25] Updated blog post data structure handling
- [2025-01-25] Improved error logging for API responses

## User Feedback Integration
- Improved error messaging for blog loading failures
- Added prefetching for better navigation experience
- Enhanced type safety for better reliability

# Strapi Field Mapping Solution Pattern

## Problem Context
When working with Strapi API responses, we encountered inconsistencies in field naming conventions, particularly with case sensitivity. This caused issues where data wasn't being properly mapped in our frontend application because the code was looking for fields with specific casing that didn't match the API response.

## Specific Example
In our blog system, the content field was being returned as "Content" (uppercase) from the API, but our code was looking for "content" (lowercase). This resulted in blog posts appearing without their content, even though the data was present in the API response.

## Solution Pattern
We developed a robust solution that can be applied to any Strapi API integration where field naming might be inconsistent.

### 1. Data Mapping Strategy
```typescript
const mappedPost = {
  id: post.id,
  title: attributes.title || '',
  // Check multiple possible field names with fallbacks
  content: attributes.Content || attributes.content || '',
  slug: attributes.slug || '',
  publishedAt: attributes.publishedAt || null,
  // ... other fields
};
```

### 2. Type System Support
```typescript
// Interface that accounts for field variations
interface StrapiRawBlogPost {
  id: string;
  attributes: {
    title?: string;
    Content?: string;  // Allow uppercase version
    content?: string;  // Allow lowercase version
    slug?: string;
    // ... other fields
  };
}

// Type guard that checks for either field
export function isStrapiRawBlogPost(data: any): data is StrapiRawBlogPost {
  return data && 
    typeof data === 'object' && 
    'id' in data && 
    'attributes' in data &&
    typeof data.attributes === 'object' &&
    'title' in data.attributes &&
    ('Content' in data.attributes || 'content' in data.attributes);
}
```

### 3. Normalizer Implementation
```typescript
export function normalizeBlogPost(raw: StrapiRawBlogPost): BlogPost {
  return {
    id: raw.id,
    title: raw.attributes.title || '',
    // Handle both cases
    content: raw.attributes.Content || raw.attributes.content || '',
    // ... other fields
  };
}
```

## Where to Apply This Pattern
This solution pattern should be used in the following situations:

1. When integrating with any Strapi API where field naming conventions might vary
2. When dealing with data migrations where field names might change
3. When building systems that need to be resilient to API changes
4. In any data mapping layer between API and frontend

## Implementation Steps

1. **Analyze API Response**
   ```typescript
   console.log('[API] Raw blog posts data:', JSON.stringify(data, null, 2));
   ```
   This helps identify all possible field names and their casing.

2. **Update Type Definitions**
   - Add interfaces that account for field variations
   - Include optional fields for all possible cases
   - Add proper type guards

3. **Implement Mapping Layer**
   - Use fallback pattern for field access
   - Add logging for debugging
   - Include proper error handling

4. **Add Validation**
   ```typescript
   console.log('[API] Mapping post:', {
     id: post.id,
     rawAttributes: attributes
   });
   ```
   This helps verify the mapping is working correctly.

## Benefits

1. **Resilience**
   - Code continues to work even if API field casing changes
   - Handles both legacy and new field names

2. **Type Safety**
   - TypeScript knows about all possible field names
   - Prevents runtime errors from undefined fields

3. **Debugging**
   - Clear logging shows what data is available
   - Easy to track where mapping might fail

4. **Maintenance**
   - Single place to update field mappings
   - Clear pattern for adding new fields

## Example Use Cases

1. **Blog Content**
   - Content/content field variations
   - Author/author name variations
   - Category/categories variations

2. **Media Fields**
   - Image/image_url/imageUrl variations
   - File/fileUrl/file_url variations

3. **Metadata Fields**
   - CreatedAt/createdAt/created_at variations
   - UpdatedAt/updatedAt/updated_at variations

## Testing Strategy

1. **Unit Tests**
   ```typescript
   test('normalizer handles Content field', () => {
     const raw = {
       id: '1',
       attributes: { Content: 'test' }
     };
     expect(normalizeBlogPost(raw).content).toBe('test');
   });

   test('normalizer handles content field', () => {
     const raw = {
       id: '1',
       attributes: { content: 'test' }
     };
     expect(normalizeBlogPost(raw).content).toBe('test');
   });
   ```

2. **Integration Tests**
   - Test with actual API responses
   - Verify all field variations work
   - Check error handling

## Monitoring and Maintenance

1. **Logging**
   - Log raw API responses
   - Log mapped data
   - Track any mapping failures

2. **Error Handling**
   - Provide fallback values
   - Log mapping errors
   - Handle missing fields gracefully

## Last Updated
2025-01-15

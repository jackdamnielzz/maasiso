# News API Integration Issue

## Problem Description
The news page is failing to display content due to mismatches between the Strapi API response structure and frontend expectations. This is causing multiple TypeScript errors and failed API calls.

## Technical Details

### API Response Structure
Strapi returns data in the following format:
```json
{
  "data": [
    {
      "id": number,
      "documentId": string,
      "title": string,
      "slug": string,
      "content": string,
      "seoTitle": string,
      "seoDescription": string,
      "seoKeywords": string,
      "publicationDate": string,
      "createdAt": string,
      "updatedAt": string,
      "publishedAt": string,
      "readingTime": number,
      "isSeriesPart": boolean,
      "seriesTitle": string,
      "seriesOrder": number,
      "articledescription": string
    }
  ],
  "meta": {
    "pagination": {
      "page": number,
      "pageSize": number,
      "pageCount": number,
      "total": number
    }
  }
}
```

### Current Frontend Implementation
The frontend code expects:
```typescript
interface NewsArticle {
  title: string;
  slug: string;
  content: string;
  // ... other fields
}

interface NewsResponse {
  articles: NewsArticle[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  }
}
```

### Error Points
1. Data Access:
   - Frontend tries to access `articlesResponse.articles`
   - Strapi provides data at `response.data`

2. Type Mismatches:
   - Cannot read properties of undefined (reading 'title')
   - Cannot read properties of undefined (reading 'name')
   - Cannot read properties of undefined (reading 'data')

3. API Endpoints:
   - /api/pages?filters[slug][$eq]=news returns 400 Bad Request
   - /api/categories returns incorrect data structure
   - /api/news-articles pagination parameters may be incorrect

## Required Changes

### 1. Type Definitions (src/lib/types.ts)
```typescript
interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

interface NewsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  // ... other fields
}

type NewsResponse = StrapiResponse<NewsArticle>;
```

### 2. API Functions (src/lib/api.ts)
```typescript
export async function getNewsArticles(): Promise<NewsResponse> {
  const response = await fetch(`${API_URL}/api/news-articles?...`);
  const data = await response.json();
  return data; // Already in correct format
}
```

### 3. Component Updates
- NewsPageClient: Add null checks and proper type assertions
- NewsPageServer: Update data access patterns
- Add error boundaries for better error handling

## Testing Steps
1. Verify API responses:
   ```bash
   curl -H "Authorization: Bearer ${TOKEN}" http://153.92.223.23:1337/api/news-articles
   ```

2. Test individual endpoints:
   - /api/news-articles
   - /api/categories
   - /api/pages with filters

3. Verify frontend components:
   - Check data transformation
   - Test error handling
   - Verify pagination

## Implementation Plan
1. Update type definitions
2. Modify API functions
3. Update components
4. Add error handling
5. Test all changes
6. Deploy and verify

## Notes
- All API calls must include Authorization header
- Consider implementing retry logic for failed requests
- May need to update Strapi query parameters
- Consider adding error boundaries for better error handling
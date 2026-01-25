# Search Implementation Guide

## Overview
The MaasISO search system provides relevance-based search with field-scope filtering for blog posts and news articles.

## Architecture

### Components
1. **API Endpoint**: `app/api/search/route.ts`
   - Accepts query, scope, type, date filters, pagination
   - Fetches candidates from Strapi
   - Calculates relevance scores
   - Returns sorted, paginated results

2. **Scoring Utility**: `src/lib/utils/searchScoring.ts`
   - Token-based matching (case-insensitive)
   - Field weights: title=10, summary=5, content=1
   - Log-scaled multi-occurrence contributions
   - Respects field scope filters

3. **Client API**: `src/lib/api.ts`
   - `searchV2()` function for new search
   - `search()` preserved for backwards compatibility

4. **UI Components**:
   - `SearchFilters.tsx`: Scope filter buttons
   - `SearchPage.tsx`: Server component using searchV2
   - `SearchResults.tsx`: Renders scored results
   - `SearchResultItem.tsx`: Individual result with optional score

## Usage

### API Endpoint
```
GET /api/search?q=<query>&scope=<scope>&type=<type>&page=<page>
```

**Parameters:**
- `q` (required): Search query (min 2 chars)
- `scope` (optional): `all` | `title` | `title-summary` | `content` (default: `all`)
- `type` (optional): `blog` | `news` | `all` (default: `all`)
- `dateFrom` (optional): ISO date string
- `dateTo` (optional): ISO date string
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Results per page (default: 10)

**Response:**
```typescript
{
  blog: ScoredSearchResult[],
  news: ScoredSearchResult[],
  meta: {
    totalResults: number,
    query: string,
    scope: SearchScope
  }
}
```

### Client Usage
```typescript
import { searchV2 } from '@/lib/api';

const results = await searchV2({
  query: 'iso 9001',
  scope: 'title-summary',
  contentType: 'all',
  page: 1
});
```

### URL Examples
- All fields: `/search?q=iso%209001&scope=all`
- Title only: `/search?q=iso%209001&scope=title`
- Title + summary: `/search?q=iso%209001&scope=title-summary`
- Content only: `/search?q=iso%209001&scope=content`

## Relevance Scoring

### Algorithm
1. **Tokenize**: Split query into lowercase tokens
2. **Match**: Count token occurrences in each field (case-insensitive)
3. **Score**: For each field: `weight × (1 + log₂(1 + occurrences))`
4. **Sum**: Total score = sum of all field scores
5. **Filter**: Excluded fields (based on scope) contribute 0

### Field Weights
- **Title**: 10 points (highest priority)
- **Summary/articledescription**: 5 points (medium priority)
- **Content**: 1 point (lowest priority)

### Tie-breaking
1. Relevance score (descending)
2. Publication date (most recent first)
3. Title (alphabetical)

## Testing

### Manual Testing
```bash
# Test API directly
curl "http://localhost:3000/api/search?q=iso&scope=all&pageSize=3"

# Test UI
# Navigate to: http://localhost:3000/search?q=iso%209001&scope=title
```

### Automated Testing
Create tests in `src/lib/utils/__tests__/searchScoring.test.ts`:
- Test tokenization
- Test field scoring with different weights
- Test scope filtering
- Test multi-token queries
- Test edge cases (empty query, no matches, etc.)

## Maintenance

### Adding New Fields
To make a new field searchable:
1. Update `calculateRelevanceScore()` in `searchScoring.ts`
2. Add field weight constant
3. Add scoring logic for the field
4. Update scope options if needed
5. Update UI labels in `SearchFilters.tsx`

### Tuning Weights
Field weights can be adjusted in `searchScoring.ts`:
```typescript
const WEIGHTS = {
  TITLE: 10,        // Adjust for title importance
  SUMMARY: 5,       // Adjust for summary importance
  CONTENT: 1        // Adjust for content importance
};
```

## Performance Considerations
- Current implementation fetches top 100 results per content type
- Scoring happens server-side to enable correct pagination
- Consider implementing caching for popular queries
- For very large datasets, consider:
  - Dedicated search engine (Meilisearch, Algolia)
  - Database full-text search indexes
  - Result caching with invalidation

## Future Enhancements
- [ ] Phrase matching bonus (exact phrase matches)
- [ ] Fuzzy matching for typos
- [ ] Tag/category boosting
- [ ] Author-based filtering
- [ ] Search suggestions/autocomplete
- [ ] Search analytics dashboard
- [ ] A/B testing different weight configurations

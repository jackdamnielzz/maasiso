# API Documentation

## Overview
This document describes the API integration layer between the Next.js frontend and Strapi CMS backend. The API is implemented with TypeScript and includes comprehensive type safety, error handling, and caching strategies.

## Base Configuration
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const strapiToken = process.env.STRAPI_API_TOKEN;
```

## Caching Strategies

### Static Content
Individual content items that change infrequently:
- Revalidation: 1 hour
- Cache Tags: Used for granular invalidation
- Implementation: `getStaticFetchOptions(tag)`

### List Pages
Paginated content that may change more frequently:
- Revalidation: 30 minutes
- Cache Tags: Category-based
- Implementation: `getListFetchOptions(tag)`

### Dynamic Content
Real-time or search-based content:
- No caching
- Implementation: `getDynamicFetchOptions()`

## Endpoints

### Blog Posts

#### Get Blog Posts List
```typescript
async function getBlogPosts(
  page = 1, 
  pageSize = 6, 
  categorySlug?: string
): Promise<PaginatedBlogPosts>
```
- **Purpose**: Fetch paginated list of blog posts
- **Caching**: List caching (30 minutes)
- **Parameters**:
  - page: Current page number
  - pageSize: Items per page
  - categorySlug: Optional category filter
- **Returns**: PaginatedBlogPosts with meta information

#### Get Blog Post by Slug
```typescript
async function getBlogPostBySlug(
  slug: string
): Promise<{ blogPost: BlogPost | null }>
```
- **Purpose**: Fetch single blog post by slug
- **Caching**: Static caching (1 hour)
- **Parameters**:
  - slug: Blog post URL slug
- **Returns**: BlogPost object or null

#### Get Related Posts
```typescript
async function getRelatedPosts(
  currentSlug: string,
  categoryIds: string[]
): Promise<{ blogPosts: BlogPost[] }>
```
- **Purpose**: Fetch related blog posts
- **Caching**: List caching (30 minutes)
- **Parameters**:
  - currentSlug: Current post slug to exclude
  - categoryIds: Categories to match
- **Returns**: Array of related BlogPost objects

### News Articles

#### Get News Articles List
```typescript
async function getNewsArticles(
  page = 1,
  pageSize = 6,
  categorySlug?: string
): Promise<PaginatedNewsArticles>
```
- **Purpose**: Fetch paginated list of news articles
- **Caching**: List caching (30 minutes)
- **Parameters**:
  - page: Current page number
  - pageSize: Items per page
  - categorySlug: Optional category filter
- **Returns**: PaginatedNewsArticles with meta information

#### Get News Article by Slug
```typescript
async function getNewsArticleBySlug(
  slug: string
): Promise<{ newsArticle: NewsArticle | null }>
```
- **Purpose**: Fetch single news article by slug
- **Caching**: Static caching (1 hour)
- **Parameters**:
  - slug: News article URL slug
- **Returns**: NewsArticle object or null

### Categories

#### Get Categories
```typescript
async function getCategories(): Promise<{ categories: Category[] }>
```
- **Purpose**: Fetch all available categories
- **Caching**: List caching (30 minutes)
- **Returns**: Array of Category objects

### Search

#### Search Content
```typescript
async function search(
  { query, limit = 5 }: SearchParams
): Promise<SearchResults>
```
- **Purpose**: Search across blog posts and news articles
- **Caching**: No caching (dynamic)
- **Parameters**:
  - query: Search query string
  - limit: Maximum results per content type
- **Returns**: Combined search results for blogs and news

## Data Types

### Base Types
```typescript
interface BaseContent {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
```

### Blog Post Types
```typescript
interface BlogPost extends BaseContent {
  content: string;
  author?: string;
  categories: Category[];
  tags?: Tag[];
  featuredImage?: Image;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface PaginatedBlogPosts {
  blogPosts: {
    data: BlogPost[];
    meta: PaginationMeta;
  };
}
```

### News Article Types
```typescript
interface NewsArticle extends BaseContent {
  content: string;
  categories?: {
    data: Array<{
      id: string;
      attributes: {
        name: string;
        description: string;
        slug: string;
        createdAt: string;
        updatedAt: string;
      };
    }>;
  };
  summary?: string;
  author?: string;
  featuredImage?: {
    data: {
      id: string;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
}
```

## Error Handling

### API Error Handler
```typescript
function handleApiError(error: unknown, message: string): never {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(`${message}: ${error.message}`);
  }
  throw new Error(message);
}
```

### Retry Configuration
```typescript
const defaultRetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};
```

## Offline Support

### Sync Endpoints

#### Get Sync Status
```typescript
async function getSyncStatus(): Promise<SyncStatus> {
  endpoint: '/api/sync/status'
  method: 'GET'
  response: {
    lastSyncTimestamp: number;
    pendingChanges: number;
    conflicts: number;
    syncInProgress: boolean;
  }
}
```

#### Initiate Sync
```typescript
async function initiateSync(options: SyncOptions): Promise<SyncResult> {
  endpoint: '/api/sync/start'
  method: 'POST'
  body: {
    strategy: 'immediate' | 'background';
    priority: 'high' | 'normal' | 'low';
    conflictResolution: 'client-wins' | 'server-wins' | 'manual';
  }
  response: {
    syncId: string;
    status: 'initiated' | 'queued';
    estimatedTime?: number;
  }
}
```

#### Get Pending Changes
```typescript
async function getPendingChanges(): Promise<PendingChanges> {
  endpoint: '/api/sync/pending'
  method: 'GET'
  response: {
    changes: Array<{
      id: string;
      type: 'create' | 'update' | 'delete';
      resourceType: string;
      timestamp: number;
      data: Record<string, unknown>;
    }>;
  }
}
```

### Conflict Resolution Endpoints

#### Get Conflicts
```typescript
async function getConflicts(): Promise<ConflictList> {
  endpoint: '/api/conflicts'
  method: 'GET'
  response: {
    conflicts: Array<{
      id: string;
      resourceType: string;
      localChange: OfflineChange;
      serverState: Record<string, unknown>;
      conflictType: 'update' | 'delete';
      conflictFields?: string[];
      timestamp: number;
    }>;
  }
}
```

#### Resolve Conflict
```typescript
async function resolveConflict(
  conflictId: string,
  resolution: ResolutionStrategy
): Promise<ResolutionResult> {
  endpoint: '/api/conflicts/:conflictId/resolve'
  method: 'POST'
  body: {
    strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
    mergeFields?: Record<string, 'client' | 'server'>;
    manualData?: Record<string, unknown>;
  }
  response: {
    status: 'resolved' | 'partial' | 'failed';
    resolvedData?: Record<string, unknown>;
    remainingConflicts?: number;
  }
}
```

### Background Sync Queue

#### Queue Format
```typescript
interface SyncQueueItem {
  id: string;
  operation: {
    type: 'create' | 'update' | 'delete';
    resourceType: string;
    data: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
    lastAttempt?: number;
    error?: {
      code: string;
      message: string;
      context?: Record<string, unknown>;
    };
  };
  status: 'pending' | 'in-progress' | 'failed' | 'completed';
  priority: number;
  dependencies?: string[];
}
```

#### Queue Management Endpoints

##### Get Queue Status
```typescript
async function getQueueStatus(): Promise<QueueStatus> {
  endpoint: '/api/sync/queue/status'
  method: 'GET'
  response: {
    totalItems: number;
    processing: number;
    failed: number;
    completed: number;
    nextScheduled?: number;
  }
}
```

##### Retry Failed Items
```typescript
async function retryFailedItems(): Promise<RetryResult> {
  endpoint: '/api/sync/queue/retry'
  method: 'POST'
  response: {
    retriedCount: number;
    successCount: number;
    failedCount: number;
    remainingRetries: number;
  }
}
```

### Error Handling and Recovery

#### Error Response Format
```typescript
interface SyncError {
  code: string;
  message: string;
  timestamp: number;
  context: {
    operation: string;
    resourceType: string;
    resourceId?: string;
    attemptNumber: number;
    networkStatus?: string;
  };
  recovery?: {
    type: 'automatic' | 'manual';
    action: string;
    requiredInput?: string[];
  };
}
```

#### Status Codes
- `409`: Conflict detected
- `412`: Precondition failed (version mismatch)
- `423`: Resource locked (being modified)
- `449`: Retry with updated data
- `503`: Sync service unavailable

## Best Practices

1. **Error Handling**
   - Always use handleApiError for consistent error handling
   - Include context in error messages
   - Implement retry mechanism for transient failures
   - Handle offline-specific errors gracefully

2. **Caching**
   - Use appropriate caching strategy based on content type
   - Implement cache tags for granular invalidation
   - Consider revalidation periods carefully
   - Implement offline-first caching strategies

3. **Type Safety**
   - Use type guards to validate API responses
   - Implement proper data normalization
   - Maintain consistent type definitions
   - Ensure offline data structure compatibility

4. **Performance**
   - Use pagination for large datasets
   - Implement proper caching strategies
   - Consider data prefetching for common paths
   - Optimize sync operations for bandwidth and battery

5. **Offline Operations**
   - Queue operations when offline
   - Implement proper conflict resolution
   - Handle sync failures gracefully
   - Monitor sync queue performance

Last Updated: 2025-01-08

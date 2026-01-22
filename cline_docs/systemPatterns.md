# System Architecture and Patterns

## Overall Architecture

### Two-VPS Setup
1. VPS1 (153.92.223.23)
   - Strapi CMS
   - Content Management
   - API Endpoints
   - Media Storage

2. VPS2 (147.93.62.188)
   - Next.js Frontend
   - Static Site Generation
   - API Proxying
   - Client-side Rendering

## Key Patterns

### Authentication Flow
- JWT-based authentication
- Token storage in environment variables
- Proxy-based API requests
- Automatic token refresh mechanism

### Data Flow
```
[Strapi CMS (VPS1)] -> [API Proxy (VPS2)] -> [Next.js Frontend (VPS2)] -> [Client Browser]
```

### Content Management Patterns
1. Tag System
   ```
   [Article]
   └── [Tags]
       ├── Multiple Selection
       ├── Count Aggregation
       └── Filter Combination
   ```
   - URL-based filtering
   - Tag state persistence
   - Combined filtering with categories
   - Count-based sorting

2. Image Handling
   ```
   [Image URL]
   └── [URL Processing]
       ├── API URL Prefixing
       ├── Protocol Validation
       └── Error Fallback
   ```
   - Automatic URL construction
   - Progressive loading
   - Error state management
   - Fallback UI patterns

### Deployment Pattern
1. Local Development
   - Environment sync from production
   - Local testing and validation
   - Build verification

2. Production Deployment
   - Automated file synchronization
   - Progressive deployment
   - Rollback capabilities

### Content Fetching Strategy
- Dynamic page rendering
- Direct Strapi API calls
- Real-time content updates
- No server-side caching
- Browser-level caching only

## Technical Implementation

### Frontend Architecture
1. Next.js App Router
   - Server Components
   - Client Components
   - API Routes

2. Component Structure
   ```
   [Page Component]
   └── [Server Component]
       └── [Client Component]
           ├── [UI Components]
           └── [Feature Components]
               ├── TagList
               ├── NewsCard
               └── LazyImage
   ```

3. Feature Components
   - Modular design
   - State isolation
   - URL-based state management
   - Error boundary integration

### API Integration
1. Direct Strapi Integration
   - REST API endpoints
   - GraphQL queries
   - Dynamic rendering
   - Media handling

2. Proxy Layer
   - Request forwarding
   - Response transformation
   - Error handling

### Development Workflow
1. Code Synchronization
   ```
   [Production] -> [Local Dev] -> [Testing] -> [Production]
   ```

2. Environment Management
   ```
   [.env.production] -> [.env.local] -> [.env.development]
   ```

## Current Challenges

### Authentication Issues
1. Token Validation
   - 401 errors during build
   - Token refresh failures
   - Environment variable synchronization

2. Build Process
   - Static generation failures
   - API timeout issues
   - Environment configuration

### Proposed Solutions
1. Authentication
   - Implement token refresh mechanism
   - Add request retry logic
   - Improve error handling

2. Build Process
   - Add build-time validation
   - Implement progressive deployment
   - Enhanced error reporting

## Future Improvements

### Recent Changes
1. Content Fetching
   - Removed caching layer
   - Implemented direct API calls
   - Added dynamic rendering configuration

### Short Term
1. Authentication
   - Token management system
   - Error recovery
   - Request retry logic

2. Deployment
   - Atomic deployments
   - Rollback mechanism
   - Health checks

3. Performance
   - Monitor page load times
   - Analyze server load
   - Optimize API calls

### Long Term
1. Infrastructure
    - Load balancing
    - CDN integration
    - Monitoring system

2. Development
    - Automated testing
    - CI/CD pipeline
    - Documentation automation

## TypeScript Patterns (Added March 18, 2025)

### Next.js App Router Type Patterns
1. Dynamic Route Pages
```typescript
// Correct pattern for dynamic routes
type PageParams = { slug: string };

export async function generateMetadata(
  { params }: { params: PageParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Implementation
}

export default async function Page({ params }: { params: PageParams }) {
  // Implementation
}
```

### Component Type Patterns
1. Props Typing
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

function Component({ required, optional, children }: ComponentProps) {
  // Implementation
}
```

2. Event Handlers
```typescript
interface EventHandlerProps {
  onEvent: (data: EventData) => void;
  onError?: (error: Error) => void;
}
```

### API Integration Types
1. Response Types
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}
```

2. Error Types
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

### Current TypeScript Challenges
1. Page Props Types
   - Mismatch between expected and provided types
   - Promise type requirements in App Router
   - Metadata generation type constraints

2. Solutions in Progress
   - Using ResolvingMetadata type
   - Proper typing for dynamic routes
   - Handling Promise types in server components

### Type Safety Guidelines
1. Best Practices
   - Use explicit types
   - Avoid type assertions
   - Implement type guards
   - Document complex types

2. Common Anti-patterns to Avoid
   - Using 'any' type
   - Type assertions without validation
   - Incomplete interface definitions
   - Missing error type handling
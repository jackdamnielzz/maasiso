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

### Deployment Pattern
1. Local Development
   - Environment sync from production
   - Local testing and validation
   - Build verification

2. Production Deployment
   - Automated file synchronization
   - Progressive deployment
   - Rollback capabilities

### Caching Strategy
- Static page generation
- Incremental Static Regeneration (ISR)
- API response caching
- Browser-level caching

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
           └── [UI Components]
   ```

### API Integration
1. Direct Strapi Integration
   - REST API endpoints
   - GraphQL queries
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

### Short Term
1. Authentication
   - Token management system
   - Error recovery
   - Request retry logic

2. Deployment
   - Atomic deployments
   - Rollback mechanism
   - Health checks

### Long Term
1. Infrastructure
   - Load balancing
   - CDN integration
   - Monitoring system

2. Development
   - Automated testing
   - CI/CD pipeline
   - Documentation automation
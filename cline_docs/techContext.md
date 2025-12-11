# Technical Context - Updated March 18, 2025

## TypeScript Configuration and Common Issues

### Next.js App Router TypeScript Integration

1. Page Props Types
   - App Router pages require specific type structures
   - Metadata generation functions have unique type requirements
   - Dynamic route parameters need special type handling
   - Common issue: Type mismatch between expected Promise types and provided types

2. Known TypeScript Challenges
   - Page props type mismatches in dynamic routes
   - Metadata generation type requirements
   - Server component type constraints
   - Promise type requirements in App Router

3. Common Error Patterns
   ```typescript
   // Error: Type mismatch with Next.js expected types
   Type '{ params: { slug: string; }; searchParams?: { [key: string]: string | string[] | undefined; } }'
   does not satisfy the constraint 'PageProps'
   ```

4. Best Practices
   - Use ResolvingMetadata type for metadata generation
   - Properly type dynamic route parameters
   - Handle Promise types in server components
   - Follow Next.js 13+ type patterns

### Project TypeScript Setup

1. Configuration Files
   - tsconfig.json: Base TypeScript configuration
   - tsconfig.prod.json: Production-specific settings
   - jest.config.js: Test configuration with TypeScript support

2. Type Definitions
   - Custom type definitions in src/lib/types
   - Component-specific types in respective directories
   - API response type definitions
   - Strapi data structure types

3. Type Checking
   - Strict mode enabled
   - Null checks enforced
   - Strict function types
   - No implicit any

4. Common Type Patterns
   - Interface for component props
   - Type guards for data validation
   - Utility types for API responses
   - Generic types for reusable components

### Recent Type System Improvements

1. Added Types
   - MonitoringService interface
   - WebVitalMetric interface
   - Image type normalization
   - Page props types

2. Fixed Issues
   - trackEvent method typing
   - Image component type consistency
   - Lodash type definitions
   - Performance monitoring types

3. Pending Improvements
   - Stricter type checking
   - Better error messages
   - Comprehensive type tests
   - Automated type validation

### Development Guidelines

1. Type Safety
   - Always use explicit types
   - Avoid type assertions when possible
   - Use type guards for runtime checks
   - Document complex type structures

2. Error Handling
   - Type-safe error handling
   - Error boundary types
   - API error type definitions
   - Logging type safety

3. Testing
   - TypeScript-aware tests
   - Type coverage monitoring
   - Integration test types
   - Mock type definitions

4. Documentation
   - Type documentation in JSDoc
   - Complex type examples
   - Type migration guides
   - Breaking changes documentation

## Technology Stack

### Frontend (VPS2: 147.93.62.188)
- Next.js with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Server and Client Components
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)

### Backend (VPS1: 153.92.223.23)
- Strapi CMS
- REST API endpoints
- Media storage and handling
- JWT authentication

## Development Environment

### Configuration
```bash
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://maasiso.nl
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
NEXT_PUBLIC_SITE_URL=https://maasiso.nl

# Development Environment Variables (Updated March 18, 2025)
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRAPI_TOKEN=[secure-token] # Required for API authentication
```

### Environment Configuration Notes
- Development environment requires direct connection to Strapi backend
- API token must be properly configured for authentication
- Local development server runs on port 3000
- Strapi backend accessible at 153.92.223.23:1337
- Environment variables must be properly set to avoid connection issues

### Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  typescript: {
    tsconfigPath: './tsconfig.prod.json'
  }
}
```

## Architecture Patterns

### Component Structure
- Server Components for data fetching
- Client Components for interactivity
- Feature-based organization
- Error boundaries implementation

### Data Flow
1. Strapi CMS (Data Source)
2. API Proxy Layer (Data Transform)
3. Next.js Frontend (Presentation)
4. Client Browser (User Interface)

### Caching Strategy
- Static page generation
- Incremental Static Regeneration
- API response caching
- Browser-level caching

## Development Workflow

### Local Development
1. Environment synchronization
2. Local testing
3. Build verification
4. Type checking

### Deployment Process
1. Build validation
2. Progressive deployment
3. Health checks
4. Rollback capability

## Technical Constraints

### Authentication
- JWT-based system
- Token refresh mechanism
- Environment variable management
- Proxy-based requests

### Performance Requirements
- Fast initial load
- Optimized image loading
- Efficient tag filtering
- Responsive UI

### Security Considerations
- API token protection
- Environment variable security
- CORS configuration
- Request validation

## Monitoring & Error Handling

### Error Management
- Comprehensive error logging
- Type-safe error handling
- Fallback mechanisms
- User-friendly error messages

### Performance Monitoring
- Load time tracking
- API response monitoring
- Error rate tracking
- User interaction metrics

## Testing Strategy

### Test Types
- Component testing
- API integration tests
- Build verification
- Performance testing

### Test Environment
- Local development setup
- Production-like staging
- Automated testing tools
- Manual verification

## Documentation Requirements

### Code Documentation
- TypeScript types
- Component documentation
- API documentation
- Error handling patterns

### System Documentation
- Architecture overview
- Deployment guides
- Troubleshooting guides
- Recovery procedures
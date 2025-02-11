# Tech Context

## Technologies used
1. Frontend:
   - Next.js 15.1.6 (React framework)
   - TypeScript for type safety
   - React for component architecture
   - TailwindCSS for styling
   - Fetch API for data fetching

2. Backend:
   - Strapi CMS for content management
   - Node.js runtime environment
   - PostgreSQL database
   - Next.js API routes for proxying

3. Infrastructure:
   - Nginx web server
   - PM2 process manager
   - Let's Encrypt SSL
   - VPS hosting (147.93.62.188)

## Development setup
1. Development Environment:
   - VS Code IDE
   - Git version control
   - GitHub repository
   - Node.js v18+
   - npm package manager

2. Build Tools:
   - TypeScript compiler
   - Next.js build system
   - ESLint for code quality
   - Prettier for code formatting

3. Testing Tools:
   - Jest for unit testing
   - React Testing Library
   - Cypress for E2E testing
   - Vitest for component testing

## Technical constraints
1. Deployment:
   - VPS-based deployment
   - Production environment at maasiso.nl
   - SSL/HTTPS requirement
   - Node.js runtime constraints

2. API Security:
   - Server-side API proxy required
   - Token-based authentication
   - CORS restrictions
   - Rate limiting considerations

3. Performance:
   - Static page generation where possible
   - API response caching
   - Image optimization requirements
   - Bundle size optimization

4. Browser Support:
   - Modern browser focus
   - Progressive enhancement
   - Responsive design requirements
   - Mobile-first approach

## Architecture Overview
1. Frontend Architecture:
   - Next.js pages and components
   - Client-side state management
   - Server-side rendering capabilities
   - Static site generation

2. API Architecture:
   - Next.js API routes
   - Secure proxy to Strapi
   - Request validation
   - Response caching

3. Deployment Architecture:
   - Nginx reverse proxy
   - PM2 process management
   - SSL termination
   - Static asset serving

4. Security Architecture:
   - HTTPS everywhere
   - API request proxying
   - Security headers
   - Content security policy

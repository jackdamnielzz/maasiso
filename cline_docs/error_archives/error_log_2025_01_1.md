# Error Log Archive 2025-01-1

### Next.js App Router Dynamic Route Parameter Handling Error
- **Date:** 2025-01-12
- **Error Type:** Runtime
- **Environment:** Development
- **Status:** Resolved
- **Description:**
  - Error message: "Route '/blog/[slug]' used `params.slug`. `params` should be awaited before using its properties."
  - Stack trace: Multiple locations in blog/[slug]/page.tsx
  - Affected components: Blog post detail page, dynamic routing
- **Impact:**
  - Severity: High
  - Affected users: All users trying to access blog posts
  - Business impact: Blog post detail pages not functioning correctly
- **Analysis:**
  - Root cause: Next.js 13+ App Router treats route parameters as promises, requiring await
  - Affected locations:
    1. Main page component's initial params check
    2. Metadata generation function
    3. Data fetching call
  - Technical context: Part of React Server Components architecture change
- **Resolution:**
  - Root cause: Next.js 13+ App Router treats route parameters as promises, requiring await
  - Fix implemented: 
    1. Updated Props type to handle Promise<Params>
    2. Added isPromise type guard function
    3. Implemented proper parameter resolution with error handling
    4. Created error boundary component
  - Prevention measures:
    - Added async parameter handling documentation to knowledgeBase.md
    - Implemented TypeScript types for async params
    - Added error boundary for graceful error handling
- **Timeline:**
  - Detected: 2025-01-12
  - Investigation started: 2025-01-12
  - Resolved: 2025-01-12

### GraphQL Permission Error
- **Date:** 2025-01-12
- **Error Type:** Runtime
- **Environment:** Development
- **Status:** Resolved
- **Description:**
  - Error message: "Forbidden access"
  - Stack trace: ForbiddenError at authorize (/var/www/strapi/node_modules/@strapi/plugin-graphql/dist/server/index.js:304:19)
  - Affected components: GraphQL API, Blog Post queries
- **Impact:**
  - Severity: Medium
  - Affected users: Public API consumers
  - Business impact: Blog posts not displaying on frontend
- **Resolution:**
  - Root cause: Missing public permissions for Blog Post content type
  - Fix implemented: Configured public role permissions in Strapi admin
  - Prevention measures: Added permission check to deployment checklist
- **Timeline:**
  - Detected: 2025-01-12 11:45 UTC
  - Investigated: 2025-01-12 11:46 UTC
  - Resolved: 2025-01-12 11:47 UTC

### GraphQL Query Structure Error
- **Date:** 2025-01-12
- **Error Type:** Runtime
- **Environment:** Development
- **Status:** Resolved
- **Description:**
  - Error message: "Cannot query field 'data' on type 'BlogPost'"
  - Stack trace: GraphQLError at Object.Field
  - Affected components: GraphQL queries, Blog Post component
- **Impact:**
  - Severity: Low
  - Affected users: Development team
  - Business impact: Development delay
- **Resolution:**
  - Root cause: Incorrect GraphQL query structure
  - Fix implemented: Updated query to match Strapi's schema
  - Prevention measures: Added GraphQL schema documentation to knowledgeBase.md
- **Timeline:**
  - Detected: 2025-01-12 11:48 UTC
  - Investigated: 2025-01-12 11:49 UTC
  - Resolved: 2025-01-12 11:50 UTC

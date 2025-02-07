# Technical Context

## Technology Stack

### Frontend
1. Framework
   - Next.js 14
   - React 18
   - TypeScript 5.2

2. UI Components
   - Custom component library
   - Tailwind CSS
   - CSS Modules
   - react-markdown for content rendering
   - Tailwind Typography (prose) for markdown styling
   - Component-specific style overrides

3. State Management
   - React Hooks
   - Context API
   - Local state

### Backend
1. CMS
   - Strapi v4
   - PostgreSQL
   - Node.js

2. API
   - REST endpoints
   - JWT authentication
   - Rate limiting

### Development Tools
1. Build Tools
   - Webpack 5
   - Babel 7
   - PostCSS

2. Testing
   - Jest
   - React Testing Library
   - Cypress

3. Code Quality
   - ESLint
   - Prettier
   - TypeScript strict mode

## Development Environment

### Local Setup
1. Node.js
   - Version: 18.x LTS
   - Package manager: npm

2. Database
   - PostgreSQL 14
   - Local instance

3. IDE
   - VSCode
   - Extensions:
     - ESLint
     - Prettier
     - TypeScript
     - Tailwind CSS

### Development Server
1. Next.js
   - Development mode
   - Hot reloading
   - Error overlay
   - Customized logging levels:
     - Minimal logging: `npm run dev:quiet`
     - Verbose logging: `npm run dev`

2. Strapi
   - Development mode
   - Admin panel
   - API endpoints

### Logging Configuration
1. Custom logging setup in `server.js` and `next.config.js`
2. Environment variable `NEXT_SUPPRESS_LOGS` controls log suppression
3. Custom startup message provides instructions for detailed logging
4. Log levels can be adjusted using the `LOG_LEVEL` environment variable

## Current Configuration

### Next.js Config
```javascript
{
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'api.maasiso.org'],
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    strict: true,
  }
}
```

### TypeScript Config
```javascript
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Environment Variables
1. Development
   ```
   NEXT_PUBLIC_API_URL=http://localhost:1337
   NEXT_PUBLIC_ASSET_PREFIX=
   STRAPI_TOKEN=[redacted]
   ```

2. Production
   ```
   NEXT_PUBLIC_API_URL=https://api.maasiso.org
   NEXT_PUBLIC_ASSET_PREFIX=/assets
   STRAPI_TOKEN=[redacted]
   ```
## Recent Technical Changes

### Component Updates
1. NewsArticleContent
   ```typescript
   // Enhanced markdown rendering with consistent styling
   const NewsArticleContent: React.FC<NewsArticleContentProps> = ({ article }) => {
     return (
       <article className="max-w-3xl mx-auto px-4 py-4">
         <header className="mb-8">
           <h1 className="text-4xl font-extrabold text-[#091E42] mb-4 leading-tight">
             {title}
           </h1>
           {/* Metadata section */}
         </header>
         
         {/* Featured image section */}
         
         <div className="prose prose-lg max-w-none text-[#091E42]/90
           prose-headings:font-bold prose-headings:tracking-tight
           prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12
           prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
           prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8">
           <ReactMarkdown
             components={{
               h1: ({ node, ...props }) => <h1 {...props} className="text-4xl font-bold mb-6 mt-8" />,
               h2: ({ node, ...props }) => <h2 {...props} className="text-3xl font-bold mb-4 mt-6" />,
               p: ({ node, ...props }) => <p {...props} className="mb-4 leading-relaxed" />,
               // Additional component overrides for consistent styling
             }}
           >
             {content}
           </ReactMarkdown>
         </div>
       </article>
     );
   };
   ```

### Utility Functions
### Utility Functions
1. Type Guards
   ```typescript
   // Promise type guard for metadata generation
   export function isPromise(value: unknown): value is Promise<unknown> {
     return value instanceof Promise;
   }
   ```

2. Text Processing
   ```typescript
   // Text excerpt generation with configurable length
   export function getExcerpt(text: string, maxLength: number = 155): string {
     if (text.length <= maxLength) return text;
     return text.slice(0, maxLength).trim() + '...';
   }
   ```

3. Date Formatting
   ```typescript
   // Localized date formatting
   export function formatDate(dateString: string): string {
     return new Intl.DateTimeFormat('nl-NL', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     }).format(new Date(dateString));
   }
   ```

### Dynamic Route Handling
1. Parameter Processing
   ```typescript
   // Before
   const slug = params.slug;
   
   // After
   const slug = await Promise.resolve(params.slug);
   const decodedSlug = decodeURIComponent(slug);
   ```

2. URL Parameter Handling
   ```typescript
   // Category filtering with searchParams
   const selectedCategory = typeof searchParams?.category === 'string'
     ? searchParams.category
     : undefined;

   // Client-side navigation with URLSearchParams
   const handleCategoryChange = (value: string) => {
     const params = new URLSearchParams(searchParams?.toString() || '');
     if (value) {
       params.set('category', value);
     } else {
       params.delete('category');
     }
     params.delete('page'); // Reset to first page on category change
     router.replace(`/news?${params.toString()}`);
   };
   ```

2. Error Handling
   ```typescript
   try {
     await validateSlug(decodedSlug);
     const { blogPost } = await getBlogPostData(decodedSlug);
   } catch (error) {
     // Improved error handling
   }
   ```

### Image Loading
1. LazyImage Component
   ```typescript
   const [hasError, setHasError] = useState(false);
   
   // Internal error handling
   const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
     setHasError(true);
     onError?.(event);
   }, [onError]);
   ```

2. Priority Loading
   ```typescript
   <Image
     src={src}
     alt={alt}
     priority={priority}
     onError={handleError}
     {...props}
   />
   ```

## Performance Optimizations

### Current Metrics
- TTFB: 84.20ms
- FCP: 756.40ms
- LCP: 1150.20ms
- CLS: 0.02
- FID: 10.80ms

### Optimization Techniques
1. Image Loading
   - Priority loading for LCP
   - Lazy loading below fold
   - Proper sizing
   - Format optimization

2. Code Splitting
   - Route-based
   - Component-level
   - Dynamic imports

3. Caching
   - API responses
   - Static assets
   - Images

## Development Workflow

### Branch Strategy
- main: production
- develop: staging
- feature/*: new features
- fix/*: bug fixes

### Deployment Process
1. Local development
2. Feature branch
3. PR review
4. Staging deployment
5. Production deployment

### Testing Requirements
1. Unit tests
2. Integration tests
3. Performance tests
4. Accessibility tests

## Documentation Standards

### Code Documentation
1. TypeScript types
2. JSDoc comments
3. README files
4. Usage examples

### API Documentation
1. Endpoint descriptions
2. Request/response formats
3. Error codes
4. Authentication

## Current Technical Priorities
1. Resolve home page loading issue (High Priority)
   - Investigate and fix API request failure for the home page
   - Implement recommendations from home_page_issue_analysis.md
2. Fix TypeScript errors in RelatedPosts
3. Implement caching strategy
4. Add automated tests
5. Improve error handling
6. Optimize performance metrics
7. Test markdown rendering features:
   - Complex tables
   - Nested lists
   - Code blocks
   - Inline HTML
   - Images in markdown
8. Verify markdown-to-jsx configuration:
   - GFM plugin settings
   - HTML tag processing
   - Component overrides

## Known Issues
1. Home Page Loading Failure
   - Description: The home page (http://localhost:3000/) is not loading correctly due to a failed API request.
   - Error: 404 Not Found when fetching page data
   - Analysis and Recommendations: See cline_docs/home_page_issue_analysis.md for detailed information
   - Status: Under investigation

# Codebase Summary
Last Updated: 2025-01-19

## Key Components

### Content Management System (CMS)
- **Strapi CMS**: Headless CMS for content management
  - Located at: http://153.92.223.23/admin
  - Manages all content types
  - Dynamic page builder functionality
  - Menu and navigation management
  - Production server configuration documented in `server_access_guide.md`
  - Current implementation state documented in `cms_current_state.md`

#### Content Types Implemented
1. **Blog Posts**
   - Full SEO integration
   - Category and tag relationships
   - Media handling
   - Publication workflow

2. **Pages**
   - Dynamic layout system
   - Component-based structure
   - SEO optimization
   - Media integration

3. **News Articles**
   - Implementation completed
   - Full SEO integration
   - Category and tag relationships
   - Media handling
   - Series functionality
   - Reading time tracking
   - Publication system

4. **Services**
   - ISO standards integration
   - SEO optimization
   - Media handling
   - Related services system

5. **Tools**
   - Download management
   - Version tracking
   - Documentation system
   - Media handling

6. **Whitepapers**
   - Document handling
   - SEO integration
   - Download tracking
   - Publication workflow

7. **Supporting Types**
   - Categories (taxonomy)
   - Tags (taxonomy)
   - Testimonials
   - Users

### Component System

#### Page Blocks
```typescript
// Page Block Components
interface Button {
  text: string;
  link: string;
  style: string; // Enumeration
}

interface FeatureGrid {
  features: Feature[]; // Uses shared Feature component
}

interface Hero {
  title: string;
  subtitle: string;
  backgroundImage: Media;
  ctaButton: CtaButton; // Uses shared CtaButton component
}

interface ImageGallery {
  images: Media[];
  layout: string; // Enumeration
}

interface TextBlock {
  content: string; // Rich text (Markdown)
  alignment: string; // Enumeration
}
```

#### Shared Components
```typescript
// Reusable Components
interface CtaButton {
  text: string;
  link: string;
  style: string; // Enumeration
}

interface Feature {
  title: string;
  description: string;
  icon: Media;
  link: string;
}
```

#### Global Content Blocks
```typescript
// Content Block System
interface GlobalContentBlock {
  naam: string;
  description: string; // Rich text (Markdown)
  content: DynamicZone; // Can include any page block component
  version: string;
  contentStatus: 'draft' | 'active' | 'archived';
  usageLocations: JSON;
}
```

#### Component Reuse Patterns
1. Feature component is used within FeatureGrid for repeatable features
2. CtaButton component is used within Hero for call-to-action buttons
3. All components can be used within Global Content Blocks for maximum reusability

#### Component Categories
1. Page Blocks: Larger, composed components for page sections
   - Button
   - Feature-grid
   - Hero
   - Image-gallery
   - Text Block

2. Shared: Reusable building blocks
   - Cta-button
   - Feature

3. Global Blocks: Reusable content sections
   - Can contain any combination of page blocks
   - Tracks usage and versioning
   - Supports content workflow (draft/active/archived)

### Architecture Overview

#### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components
│   │   │   ├── CtaButton/
│   │   │   └── Feature/
│   │   ├── blocks/          # Page block components
│   │   │   ├── Button/
│   │   │   ├── FeatureGrid/
│   │   │   ├── Hero/
│   │   │   ├── ImageGallery/
│   │   │   └── TextBlock/
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and services
│   └── pages/              # Next.js pages
```

#### Backend Structure
```
backend/
├── config/
│   ├── database.js         # Database configuration
│   ├── server.js           # Server settings
│   └── middleware.js       # Middleware configuration
├── api/
│   ├── blog-post/
│   ├── news-article/
│   ├── page/
│   ├── service/
│   ├── tool/
│   └── whitepaper/
└── components/
    ├── blocks/            # Page block definitions
    └── shared/            # Shared component definitions
```

### Data Flow
1. Content created in Strapi CMS
2. Pages built using component system
3. Next.js fetches data via API
4. Components render content
5. SEO data integrated
6. Media optimized and served

## Content Management
- Dynamic page creation
- Component-based layouts
- SEO metadata management
- Menu and navigation system
- Media library with optimization

## Performance Optimizations
- Component lazy loading
- Image optimization
- API response caching
- Performance monitoring
- Database query optimization

## Testing Strategy
- Component unit tests
- Integration testing
- API endpoint testing
- Performance benchmarking
- SEO validation

## Recent Changes
- Added CMS state analysis
- Documented server configuration
- Enhanced component system
- Added SEO framework
- Improved content types

## External Dependencies
- React 18+
- Next.js 13+
- TypeScript 5.x
- Strapi CMS 5.7.0
- PostgreSQL Database

## Known Issues
- Server connectivity issues (see errorLog.md)
- Complex relationship queries need optimization
- Media optimization pipeline needs enhancement
- SEO framework requires completion
- Language support pending implementation

## Future Improvements
- Implement language support
- Enhance relationship management
- Expand SEO capabilities
- Optimize performance
- Add content analytics

## Deployment Process
1. Build and test locally
2. Run performance checks
3. Deploy to staging
4. Verify functionality
5. Deploy to production

## Monitoring
- Performance metrics
- Error tracking
- API response times
- Database performance
- Media optimization

## Security Measures
- API authentication
- Role-based access
- Data validation
- Error handling
- Security headers

## Documentation
- API documentation
- Component usage guides
- Content creation guides
- Deployment procedures
- Security protocols

## Revision History
- [2025-01-19] Added content type documentation
- [2025-01-19] Updated component system
- [2025-01-19] Added performance optimizations
- [2025-01-19] Updated deployment process

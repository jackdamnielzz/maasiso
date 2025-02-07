# Knowledge Base

## Critical System Information
- **CMS Location:** Production server (153.92.223.23)
- **Important:** The CMS is NOT meant to be run locally. All CMS development and content management must be done on the production server.
- **Access Method:** Via server admin panel (http://153.92.223.23/admin)
- **Development Process:** 
  1. Always check server connectivity first
  2. All CMS changes must be made directly on the server
  3. No local CMS setup should be attempted
  4. Server issues must be resolved before proceeding with CMS tasks

## Template System Architecture

### 1. Template Types
- **Page Templates**
  * Purpose: Complete page layouts
  * Usage: Base templates for different content types
  * Example: Standard Content Page template

- **Section Templates**
  * Purpose: Reusable page sections
  * Usage: Common sections across multiple pages
  * Example: Contact Section template

- **Layout Presets**
  * Purpose: Basic layout structures
  * Usage: Define content organization
  * Note: Styling handled by frontend (Tailwind CSS)

### 2. Template Best Practices
- Create templates for commonly used layouts
- Keep templates modular and reusable
- Use dynamic zones for flexibility
- Document template purposes and usage
- Test templates with different content types

### 3. Implementation Guidelines
- Always implement on production server
- Start with basic templates
- Add complexity gradually
- Document all template configurations
- Consider content editor usability

- **CMS Location:** Production server (153.92.223.23)
- **Important:** The CMS is NOT meant to be run locally. All CMS development and content management must be done on the production server.
- **Access Method:** Via server admin panel (http://153.92.223.23/admin)
- **Development Process:** 
  1. Always check server connectivity first
  2. All CMS changes must be made directly on the server
  3. No local CMS setup should be attempted
  4. Server issues must be resolved before proceeding with CMS tasks

Last Updated: 2025-01-19

## Content Type Design Patterns

### Base Content Type Structure
All content types follow a consistent base structure to ensure uniformity and maintainability:

```typescript
interface BaseContentType {
  // Basic Fields
  title: string;          // Human-readable title
  slug: string;          // URL-friendly identifier
  content?: string;      // Optional rich text content
  
  // SEO Fields
  seoTitle: string;      // SEO-optimized title
  seoDescription: string; // Meta description
  seoKeywords: string;   // Meta keywords
  
  // Metadata
  publicationDate: Date; // Publication timestamp
  status: 'draft' | 'published';
}
```

### Content Type Relationships
We implement relationships using a consistent pattern:

```typescript
interface ContentRelation {
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  target: string;       // Target content type
  inversedBy?: string;  // Field name in target type
  mappedBy?: string;    // Field name in current type
}

interface RelationshipExample {
  categories: {
    type: 'manyToMany';
    target: 'category';
    inversedBy: 'blog_posts';
  };
}
```

### Component System Design
Components are organized into two categories:

1. Page Blocks (Layout Components):
```typescript
interface PageBlock {
  type: string;        // Component identifier
  position: number;    // Order in layout
  settings: unknown;   // Component-specific settings
  content: unknown;    // Component content
}
```

2. Shared Components (Reusable Elements):
```typescript
interface SharedComponent {
  name: string;        // Component name
  props: unknown;      // Component properties
  style?: unknown;     // Optional styling
}
```

## Implementation Patterns

### SEO Integration
Standard SEO implementation across content types:

```typescript
interface SEOFields {
  title: string;       // SEO-optimized title
  description: string; // Meta description
  keywords: string;    // Meta keywords
  ogImage?: Media;     // Open Graph image
  canonical?: string;  // Canonical URL
}
```

### Multi-language Support
Preparing for Dutch-first approach with future English support:

```typescript
interface LocalizedContent<T> {
  locale: 'nl' | 'en';
  content: T;
  status: 'draft' | 'published';
  fallback?: string;   // Fallback locale reference
}

interface LocalizedFields {
  title: LocalizedString;
  description: LocalizedString;
  content?: LocalizedRichText;
}

type LocalizedString = {
  [key in 'nl' | 'en']: string;
};
```

### Media Handling
Consistent media field implementation:

```typescript
interface MediaField {
  url: string;         // Media URL
  alternativeText: string; // Alt text
  caption?: string;    // Optional caption
  width?: number;      // Image width
  height?: number;     // Image height
  formats?: {          // Responsive formats
    thumbnail: MediaFormat;
    small: MediaFormat;
    medium: MediaFormat;
    large: MediaFormat;
  };
}
```

## Best Practices

### 1. Content Type Creation
- Always include SEO fields
- Implement proper relationships
- Add publication date
- Include status field
- Use meaningful slugs

### 2. Component Development
- Keep components focused
- Implement proper validation
- Document props clearly
- Consider reusability
- Test responsiveness

### 3. Relationship Management
- Define clear relationships
- Implement bi-directional when needed
- Consider performance impact
- Document dependencies
- Test cascade effects

### 4. SEO Implementation
- Use meaningful titles
- Optimize meta descriptions
- Implement proper schemas
- Consider social sharing
- Monitor SEO metrics

## Common Issues and Solutions

### 1. Relationship Performance
**Problem:** Complex relationships causing slow queries
**Solution:** Implemented query optimization:
```typescript
// Before
const result = await strapi.query('article').findOne({
  id: ctx.params.id,
  populate: '*'
});

// After
const result = await strapi.query('article').findOne({
  id: ctx.params.id,
  populate: ['categories', 'author', 'featuredImage']
});
```

### 2. Media Optimization
**Problem:** Large media files affecting performance
**Solution:** Implemented automatic optimization:
```typescript
// Media configuration
module.exports = {
  upload: {
    breakpoints: {
      xlarge: 1920,
      large: 1000,
      medium: 750,
      small: 500,
      thumbnail: 100
    },
    formats: ['webp']
  }
};
```

### 3. Content Type Validation
**Problem:** Inconsistent content structure
**Solution:** Implemented validation schemas:
```typescript
// Validation schema
module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 100
    },
    slug: {
      type: 'uid',
      targetField: 'title'
    },
    content: {
      type: 'richtext',
      required: true
    }
  }
};
```

## Server Management and Deployment

### Server Access and Maintenance
Detailed server procedures are documented in `server_access_guide.md`. Key points:
- Follow documented procedures
- Check logs before/after changes
- Use PM2 for process management
- Keep configurations clean
- Regular backups

### Common Server Operations
1. Starting Strapi:
```bash
cd /var/www/strapi
NODE_ENV=production pm2 start npm --name strapi -- run start
```

2. Checking Status:
```bash
pm2 list
systemctl status nginx
```

3. Viewing Logs:
```bash
pm2 logs strapi
tail -f /var/log/nginx/error.log
```

## Revision History
- [2025-01-19] Added content type design patterns
- [2025-01-19] Added multi-language support patterns
- [2025-01-19] Added component system design
- [2025-01-19] Updated best practices
- [2025-01-19] Added common issues and solutions

# CMS-Driven Content Management Strategy
Last Updated: 2025-01-16

## Overview

This document outlines the comprehensive strategy for managing website content through Strapi CMS, focusing on automated page creation, content placement, and navigation management without requiring manual code changes.

## Core Requirements

### 1. Dynamic Page Creation
- Create new pages directly from Strapi CMS
- Automatic frontend route generation
- No manual code changes required for new pages
- Support for different page types (standard pages, blog posts, news articles, whitepapers)

### 2. Content Placement Control
- Specify where content appears on the website
- Choose between creating new pages or adding to existing ones
- Control content order and placement within pages
- Define content relationships and cross-references

### 3. Navigation Management
- Control menu structures from CMS
  - Header navigation
  - Footer navigation
  - Sidebar menus
  - Mobile navigation
- Set menu item order and hierarchy
- Define custom link placement
- Manage navigation visibility and permissions

## Implementation Strategy

### 1. Page Management System

#### Page Creation
```typescript
interface Page {
  title: string;
  slug: string;
  type: 'standard' | 'blog' | 'news' | 'whitepaper';
  template: 'default' | 'landing' | 'article' | 'documentation';
  status: 'draft' | 'published';
  content: ContentBlock[];
  meta: {
    description: string;
    keywords: string[];
    socialImage: Media;
  };
}
```

#### Content Blocks
```typescript
interface ContentBlock {
  type: string;  // hero, text, gallery, form, etc.
  position: number;
  settings: Record<string, unknown>;
  content: unknown;
}
```

#### Automatic Route Generation
- Dynamic route handling in Next.js
- Slug-based URL structure
- Type-based prefix paths
  - /blog/[slug]
  - /news/[slug]
  - /whitepapers/[slug]
  - /[slug] (standard pages)

### 2. Navigation Management

#### Menu Structure
```typescript
interface NavigationItem {
  label: string;
  type: 'internal' | 'external';
  link: string;
  position: number;
  parent?: string;
  location: 'header' | 'footer' | 'sidebar';
  visibility: {
    desktop: boolean;
    mobile: boolean;
  };
}
```

#### Dynamic Menu Generation
- Real-time menu updates
- Position-based ordering
- Hierarchical structure support
- Device-specific visibility

### 3. Content Placement System

#### Content Location Control
```typescript
interface ContentPlacement {
  content: Content;
  location: {
    page?: string;
    section?: string;
    position: number;
  };
  display: {
    startDate?: Date;
    endDate?: Date;
    visibility: 'public' | 'private' | 'scheduled';
  };
}
```

#### Automated Content Distribution
- Content type-based placement rules
- Template section mapping
- Position management
- Scheduling system

### 4. Dynamic Content Types

#### News Articles
- Automatic creation of article pages
- Category-based organization
- Chronological ordering
- Featured article system
- Related articles linking

#### Blog Posts
- Author association
- Category and tag system
- Series management
- Reading time calculation
- Social sharing integration

#### Whitepapers
- PDF generation
- Download tracking
- Lead capture integration
- Related content suggestions

## Technical Implementation

### 1. Strapi Configuration

#### Content Type Builder
- Define flexible content types
- Create component library
- Set up dynamic zones
- Configure relations

#### API Configuration
```graphql
type Query {
  pages(filters: JSON): [Page]
  navigation(location: String): [NavigationItem]
  content(type: String, filters: JSON): [Content]
}
```

### 2. Frontend Integration

#### Dynamic Routing
```typescript
// pages/[[...slug]].tsx
export async function getStaticPaths() {
  // Fetch all possible routes from Strapi
  const paths = await fetchDynamicPaths();
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  // Fetch page data based on slug
  const pageData = await fetchPageData(params.slug);
  return { props: { pageData }, revalidate: 60 };
}
```

#### Component Registry
```typescript
const componentRegistry = {
  hero: HeroComponent,
  textBlock: TextBlockComponent,
  gallery: GalleryComponent,
  form: FormComponent,
  // ... other components
};
```

## Content Management Workflow

### 1. Page Creation
1. Log into Strapi CMS
2. Select "Create New Page"
3. Choose page type and template
4. Add content blocks
5. Configure meta information
6. Set navigation placement
7. Preview and publish

### 2. Navigation Updates
1. Access Navigation management
2. Add/edit menu items
3. Set positions and hierarchy
4. Configure visibility
5. Save and publish

### 3. Content Distribution
1. Create content in appropriate section
2. Set placement rules
3. Configure display settings
4. Add categorization
5. Preview and publish

## Current Content Type Structure

### Collection Types

#### 1. Blog Post
- **Basic Fields**
  - title (Text)
  - slug (UID)
  - content (Rich text - Markdown)
  - author (Text)
  - categories (Relation with Category)
  - tags (Relation with Tag)
  - featuredImage (Media)
- **SEO Fields**
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
- **Additional Fields**
  - publicationDate (Datetime)

#### 2. Category
- **Basic Fields**
  - name (Text)
  - slug (UID)
  - description (Text)
- **Relations**
  - blog_posts (Relation with Blog Post)
  - news_articles (Relation with News Article)

#### 3. News Article
- **Basic Fields**
  - title (Text)
  - slug (UID)
  - content (Rich text - Markdown)
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
  - categories (Relation with Category)
  - tags (Relation with Tag)
  - featuredImage (Media)
  - publicationDate (Datetime)

#### 4. Page
- **Basic Fields**
  - Title (Text)
  - slug (UID)
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
  - featuredImage (Media)
  - layout (Dynamic zone with components)
  - publicationDate (Datetime)

#### 5. Service
- **Basic Fields**
  - name (Text)
  - description (Rich text - Markdown)
  - slug (UID)
  - isoStandards (Text)
  - featuredImage (Media)
- **SEO Fields**
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
- **Additional Fields**
  - publicationDate (Datetime)

#### 6. Tag
- **Basic Fields**
  - name (Text)
  - slug (UID)
  - description (Text)
- **Relations**
  - blog_posts (Relation with Blog Post)
  - news_articles (Relation with News Article)

#### 7. Testimonial
- **Basic Fields**
  - clientName (Text)
  - company (Text)
  - quote (Rich text - Markdown)
  - rating (Number)
  - clientPhoto (Media)
  - companyLogo (Media)
  - featured (Boolean)
  - publicationDate (Datetime)

#### 8. Tool
- **Basic Fields**
  - name (Text)
  - slug (UID)
  - description (Rich text - Markdown)
  - version (Text)
  - compatibility (Text)
  - documentation (Rich text - Markdown)
- **SEO Fields**
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
- **Media Fields**
  - downloadLink (Media)
  - screenshots (Media)

#### 9. Whitepaper
- **Basic Fields**
  - title (Text)
  - slug (UID)
  - description (Rich text - Markdown)
  - version (Text)
  - author (Text)
- **SEO Fields**
  - seoTitle (Text)
  - seoDescription (Text)
  - seoKeywords (Text)
- **Media Fields**
  - downloadLink (Media)
- **Additional Fields**
  - publicationDate (Datetime)

#### 10. User
- **Basic Fields**
  - username (Text)
  - email (Email)
  - provider (Text)
  - password (Password)
  - resetPasswordToken (Text)
  - confirmationToken (Text)
  - confirmed (Boolean)
  - blocked (Boolean)
  - role (Relation with Role)

### Components

#### Component Categories
1. **Page Blocks**
   Purpose: Larger, composed components for page sections
   
   Components:
   - **Button**
     * text (Text)
     * link (Text)
     * style (Enumeration)
     * Usage: Standalone buttons within page content

   - **Feature-grid**
     * features (Component - repeatable Feature)
     * Usage: Displays multiple features in a grid layout
     * Reuse: Uses shared Feature component

   - **Hero**
     * title (Text)
     * subtitle (Text)
     * backgroundImage (Media)
     * ctaButton (Component)
     * Usage: Main banner/header sections
     * Reuse: Uses shared CtaButton component

   - **Image-gallery**
     * images (Media)
     * layout (Enumeration)
     * Usage: Display multiple images in various layouts

   - **Text Block**
     * content (Rich text - Markdown)
     * alignment (Enumeration)
     * Usage: Rich text content sections

2. **Shared Components**
   Purpose: Reusable building blocks for consistent UI elements
   
   Components:
   - **Cta-button**
     * text (Text)
     * link (Text)
     * style (Enumeration)
     * Usage: Call-to-action buttons throughout the site
     * Used by: Hero component

   - **Feature**
     * title (Text)
     * description (Text)
     * icon (Media)
     * link (Text)
     * Usage: Individual feature displays
     * Used by: Feature-grid component

3. **Global Content Blocks**
   Purpose: Reusable content sections across pages
   
   Structure:
   - **Global Content Block**
     * naam (Text, required)
     * description (Rich text - Markdown)
     * content (Dynamic zone with page blocks)
     * version (Text)
     * contentStatus (Enumeration: draft, active, archived)
     * usageLocations (JSON)
     * Usage: Create reusable content sections
     * Benefits:
       - Content consistency
       - Central management
       - Version control
       - Usage tracking

#### Component Reuse Patterns
1. **Component Composition**
   - Feature-grid uses Feature component for consistent feature display
   - Hero uses CtaButton component for consistent call-to-actions
   - Global Content Blocks can use any page block component

2. **Content Reusability**
   - Components can be used independently or within Global Content Blocks
   - Shared components ensure UI consistency
   - Version tracking enables content evolution

3. **Best Practices**
   - Use shared components for consistent UI elements
   - Leverage Global Content Blocks for repeated content
   - Track component usage through usageLocations
   - Maintain version control for content blocks

## Core Implementation Requirements

### 1. Multi-language Support (Dutch-First Approach)
- Initial implementation in Dutch only
- Infrastructure prepared for future language expansion
  - English as first additional language
  - Scalable for more languages
- Language-specific content management
  - Separate content entries per language
  - Maintain content relationships across languages
  - Language-specific media assets
- URL structure per language
  - Dutch: domain.com/pagina
  - Future English: domain.com/en/page
  - Other languages: domain.com/{lang}/{slug}
- Translation workflow
  - Mark content as ready for translation
  - Track translation status
  - Maintain content synchronization
- Language fallbacks
  - Default to Dutch when translation unavailable
  - Configurable fallback chains
  - User notification for missing translations

### 2. Content Relationships
- Cross-content references
  - Internal linking between pages
  - Content block reuse across pages
  - Dynamic reference updates
- Related content suggestions
  - Category-based relationships
  - Tag-based content matching
  - Automated relevance scoring
  - Smart content recommendations
- Content dependencies
  - Track content relationships
  - Manage shared components
  - Update propagation system
  - Dependency visualization
- Automated link management
  - Dead link detection
  - Automatic redirect creation
  - Link health monitoring
  - Cross-language link mapping

### 3. SEO Management
- Meta tag control
  - Custom meta tags per page
  - Social media optimization
  - Language-specific meta data
  - Dynamic meta tag generation
- Structured data integration
  - Schema.org implementation
  - Rich snippet optimization
  - Breadcrumb navigation
  - Organization information
- Sitemap generation
  - Automatic sitemap updates
  - Multi-language sitemaps
  - Priority and change frequency
  - Image and video sitemaps
- Redirect management
  - 301/302 redirect configuration
  - URL pattern matching
  - Bulk redirect import/export
  - Redirect chain prevention

### 4. Content Reusability
- Global content blocks
  - Reusable content sections
  - Central management
  - Version control
  - Usage tracking
- Shared component library
  - Pre-built components
  - Component customization
  - Component categories
  - Visual component picker
- Content templates
  - Page templates
  - Section templates
  - Layout presets
  - Template inheritance
- Style presets
  - Consistent styling
  - Theme management
  - Style variations
  - Brand guidelines integration

## Additional Features

### 1. Content Versioning
- Implement version control for pages
- Track content changes
- Enable rollback capabilities
- Maintain audit logs

### 2. Content Scheduling
- Time-based content visibility
- Scheduled publications
- Content expiration
- Seasonal content management

### 3. Dynamic Layouts
- Template variation system
- Section-based layout control
- Responsive design management
- Component-level styling

### 4. Performance Optimization
- Automatic image optimization
- Content caching strategies
- Lazy loading configuration
- Resource prioritization

### 5. Analytics Integration
- Page performance tracking
- Content engagement metrics
- User journey analysis
- Conversion tracking

### 6. User Permissions
- Role-based content access
- Workflow approvals
- Content restrictions
- Editor permissions

## Future Considerations

### 1. Advanced Features
- A/B testing capability
- Personalization rules
- Dynamic content recommendations
- User behavior adaptation

### 2. Integration Possibilities
- Marketing automation
- CRM integration
- Social media automation
- Email campaign management

### 3. Content Intelligence
- AI-powered content suggestions
- Automated tagging
- Content performance prediction
- SEO recommendations

## Required Improvements

### 1. Content Type Enhancements

#### News Article
- Add author relationship
- Implement article series functionality
- Add reading time calculation
- Add social sharing metadata
- Integrate with category system

#### Service
- Add related services functionality
- Implement case study relationships
- Add service category system
- Include pricing/contact information fields
- Add service availability status

#### Tool
- Add version history tracking
- Implement download statistics
- Add user feedback/rating system
- Include compatibility matrix
- Add installation guide support

#### Whitepaper Enhancements
- Add lead generation form integration
- Implement download tracking system
- Add related content connections
- Add industry category system
- Add reader analytics

### 2. Multi-language Implementation
- Add locale field to all content types
- Implement language fallback fields
- Add translation status tracking
- Include language-specific URLs
- Add language switcher metadata

### 3. Relationship Enhancements
- Implement bi-directional relationships
- Add relationship validation rules
- Create relationship visualization fields
- Implement content dependency tracking
- Add automated link management

### 4. SEO Standardization
- Standardize meta fields across types
- Add schema.org markup fields
- Implement XML sitemap fields
- Add redirect management fields
- Include canonical URL fields

### 5. Content Reusability
- Implement shared content blocks
- Add content version tracking
- Create template system
- Add content scheduling fields
- Implement content workflow status

## Revision History
- [2025-01-19] Added required improvements section
- [2025-01-19] Documented current content type structure
- [2025-01-16] Initial document creation with comprehensive content strategy

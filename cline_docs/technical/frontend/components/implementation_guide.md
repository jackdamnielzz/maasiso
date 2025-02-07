# Component Implementation Guide
Last Updated: 2025-01-19

## Overview

This guide explains how to implement components that work with our template inheritance system. It covers both creating new components and modifying existing ones to support inheritance.

## Component Types

### 1. Base Components
These are the foundational components that can be inherited and overridden.

```typescript
// Example of a base Hero component
export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: Media;
  ctaButton?: {
    text: string;
    link: string;
    style?: string;
  };
  style?: Record<string, unknown>;
}

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  ctaButton,
  style = {}
}: HeroProps) {
  return (
    <section className={`hero ${style.className || ''}`}>
      {backgroundImage && (
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt || title}
          fill
          className="hero-background"
        />
      )}
      <div className="hero-content">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {ctaButton && (
          <Button
            href={ctaButton.link}
            className={ctaButton.style}
          >
            {ctaButton.text}
          </Button>
        )}
      </div>
    </section>
  );
}
```

### 2. Inheritable Components
Components that can be extended or overridden by child templates.

```typescript
// Example of an inheritable content block
export interface ContentBlockProps {
  content: string;
  layout?: 'standard' | 'wide' | 'narrow';
  style?: Record<string, unknown>;
  extensions?: React.ReactNode[];
}

export default function ContentBlock({
  content,
  layout = 'standard',
  style = {},
  extensions = []
}: ContentBlockProps) {
  return (
    <div className={`content-block layout-${layout}`}>
      <div className="content" dangerouslySetInnerHTML={{ __html: content }} />
      {extensions.map((extension, index) => (
        <div key={index} className="content-extension">
          {extension}
        </div>
      ))}
    </div>
  );
}
```

### 3. Template-Specific Components
Components that override or extend base components for specific templates.

```typescript
// Example of a blog-specific Hero component
export interface BlogHeroProps extends HeroProps {
  author?: string;
  publishDate?: string;
  readingTime?: number;
}

export default function BlogHero({
  title,
  subtitle,
  backgroundImage,
  author,
  publishDate,
  readingTime,
  style = {}
}: BlogHeroProps) {
  return (
    <section className={`blog-hero ${style.className || ''}`}>
      {/* Base hero content */}
      <Hero
        title={title}
        subtitle={subtitle}
        backgroundImage={backgroundImage}
        style={style}
      />
      
      {/* Blog-specific additions */}
      <div className="blog-meta">
        {author && <span className="author">{author}</span>}
        {publishDate && <time className="date">{publishDate}</time>}
        {readingTime && (
          <span className="reading-time">{readingTime} min read</span>
        )}
      </div>
    </section>
  );
}
```

## Implementation Patterns

### 1. Component Extension
Extend base components using composition:

```typescript
// Example of extending a base component
function ExtendedFeatureGrid({ features, layout, additionalContent }) {
  return (
    <>
      <FeatureGrid features={features} layout={layout} />
      <div className="additional-content">
        {additionalContent}
      </div>
    </>
  );
}
```

### 2. Style Overrides
Override styles while maintaining component structure:

```typescript
// Example of style overrides
function BlogFeatureGrid({ features, style = {} }) {
  const blogStyles = {
    ...style,
    grid: 'blog-grid',
    feature: 'blog-feature',
    // Add blog-specific styles
  };

  return <FeatureGrid features={features} style={blogStyles} />;
}
```

### 3. Content Injection
Add new content to existing components:

```typescript
// Example of content injection
function EnhancedContentBlock({ content, injectedContent, position = 'after' }) {
  return (
    <div className="enhanced-content">
      {position === 'before' && injectedContent}
      <ContentBlock content={content} />
      {position === 'after' && injectedContent}
    </div>
  );
}
```

## Template Implementation

### 1. Define Template Structure

```typescript
// Template definition
const blogTemplate = {
  name: 'Blog Template',
  extends: 'Standard Template',
  components: {
    hero: {
      component: BlogHero,
      props: {
        className: 'blog-hero',
        showMeta: true
      }
    },
    content: {
      component: BlogContent,
      props: {
        layout: 'article',
        showAuthor: true
      }
    }
  }
};
```

### 2. Component Registration

```typescript
// Component registry
const componentRegistry = {
  // Base components
  hero: Hero,
  content: ContentBlock,
  features: FeatureGrid,
  
  // Template-specific components
  blogHero: BlogHero,
  blogContent: BlogContent,
  
  // Extended components
  enhancedFeatures: ExtendedFeatureGrid
};
```

### 3. Template Resolution

```typescript
// Template resolution logic
function resolveTemplate(templateName: string, content: any) {
  const template = templates[templateName];
  const parentTemplate = template.extends ? templates[template.extends] : null;
  
  return {
    ...parentTemplate,
    ...template,
    components: {
      ...parentTemplate?.components,
      ...template.components
    }
  };
}
```

## Usage Examples

### 1. Basic Template Usage

```typescript
// Using a template in a page
export default function BlogPost({ post }) {
  const template = resolveTemplate('blog', post);
  
  return (
    <PageTemplate template={template}>
      <template.components.hero {...post.hero} />
      <template.components.content {...post.content} />
      <template.components.features {...post.features} />
    </PageTemplate>
  );
}
```

### 2. Component Override

```typescript
// Override a specific component
function CustomBlogHero(props) {
  return (
    <BlogHero
      {...props}
      renderMeta={(meta) => (
        <CustomMetaDisplay {...meta} />
      )}
    />
  );
}

// Usage in template
const customBlogTemplate = {
  ...blogTemplate,
  components: {
    ...blogTemplate.components,
    hero: {
      component: CustomBlogHero,
      props: {
        className: 'custom-blog-hero'
      }
    }
  }
};
```

### 3. Style Customization

```typescript
// Customize template styles
const styledBlogTemplate = {
  ...blogTemplate,
  styles: {
    hero: {
      background: 'gradient',
      titleSize: 'large',
      spacing: 'comfortable'
    },
    content: {
      width: 'narrow',
      fontSize: 'large',
      lineHeight: 'relaxed'
    }
  }
};
```

## Best Practices

1. **Component Design**
   - Make components extensible by default
   - Use composition over inheritance
   - Support style customization
   - Implement sensible defaults

2. **Props Structure**
   - Keep props flat when possible
   - Use consistent naming conventions
   - Document all props
   - Provide type definitions

3. **Template Organization**
   - Group related components
   - Maintain clear inheritance chains
   - Document template relationships
   - Version templates appropriately

## Testing

### 1. Component Testing

```typescript
// Example component test
describe('BlogHero', () => {
  it('inherits base Hero functionality', () => {
    const { container } = render(
      <BlogHero
        title="Test"
        subtitle="Subtitle"
        backgroundImage={{ url: '/test.jpg', alt: 'Test' }}
      />
    );
    
    expect(container).toHaveTextContent('Test');
    expect(container).toHaveTextContent('Subtitle');
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('adds blog-specific features', () => {
    const { container } = render(
      <BlogHero
        title="Test"
        author="John Doe"
        publishDate="2025-01-19"
        readingTime={5}
      />
    );
    
    expect(container).toHaveTextContent('John Doe');
    expect(container).toHaveTextContent('5 min read');
  });
});
```

### 2. Template Testing

```typescript
// Example template test
describe('Blog Template', () => {
  it('correctly inherits from base template', () => {
    const template = resolveTemplate('blog');
    
    expect(template.components.hero).toBeDefined();
    expect(template.components.content).toBeDefined();
    expect(template.components.features).toBeDefined();
  });

  it('applies overrides correctly', () => {
    const template = resolveTemplate('blog');
    
    expect(template.components.hero.component).toBe(BlogHero);
    expect(template.components.content.props.layout).toBe('article');
  });
});
```

## Revision History
- [2025-01-19] Initial guide creation
- [2025-01-19] Added implementation examples
- [2025-01-19] Added testing section

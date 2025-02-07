# Template System Technical Reference
Last Updated: 2025-01-19

## System Architecture

### Overview
The template system is built on Strapi CMS with a Next.js frontend, utilizing TypeScript for type safety and GraphQL for data fetching.

### Core Components

#### 1. Content Types

```typescript
// Template Base Structure
interface Template {
  id: string;
  name: string;
  description: string;
  layout: DynamicZone[];
  category: 'page' | 'blog' | 'news' | 'service';
  isDefault: boolean;
}

// Template Inheritance Structure
interface TemplateInheritance {
  id: string;
  name: string;
  description: string;
  parentTemplate: Relation;
  childTemplate: Relation;
  overrides: JSON;
  isActive: boolean;
}

// Component Base Structure
interface Component {
  id: string;
  __component: string;
  [key: string]: unknown;
}
```

#### 2. API Endpoints

```graphql
# Query Templates
query GetTemplates {
  templates {
    data {
      id
      attributes {
        name
        description
        layout
        category
        isDefault
      }
    }
  }
}

# Query Template Inheritance
query GetTemplateInheritance {
  templateInheritances {
    data {
      id
      attributes {
        name
        description
        parentTemplate {
          data {
            id
            attributes {
              name
            }
          }
        }
        childTemplate {
          data {
            id
            attributes {
              name
            }
          }
        }
        overrides
        isActive
      }
    }
  }
}
```

### Implementation Details

#### 1. Template Resolution

```typescript
interface TemplateResolver {
  resolveTemplate(templateId: string): Promise<ResolvedTemplate>;
  applyInheritance(template: Template, inheritance: TemplateInheritance): Template;
  processOverrides(template: Template, overrides: JSON): Template;
}

class TemplateResolverImpl implements TemplateResolver {
  async resolveTemplate(templateId: string): Promise<ResolvedTemplate> {
    // 1. Fetch base template
    const template = await this.fetchTemplate(templateId);
    
    // 2. Check for inheritance
    const inheritance = await this.fetchInheritance(templateId);
    
    // 3. Apply inheritance if exists
    if (inheritance && inheritance.isActive) {
      return this.applyInheritance(template, inheritance);
    }
    
    return template;
  }
  
  applyInheritance(template: Template, inheritance: TemplateInheritance): Template {
    // Apply overrides according to inheritance rules
    return this.processOverrides(template, inheritance.overrides);
  }
}
```

#### 2. Component Registry

```typescript
interface ComponentRegistry {
  registerComponent(name: string, component: React.ComponentType): void;
  getComponent(name: string): React.ComponentType | undefined;
  hasComponent(name: string): boolean;
}

const componentRegistry: ComponentRegistry = {
  components: new Map(),
  
  registerComponent(name, component) {
    this.components.set(name, component);
  },
  
  getComponent(name) {
    return this.components.get(name);
  }
};
```

### Integration Examples

#### 1. Next.js Page Template

```typescript
// pages/[...slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { TemplateResolver } from '@/lib/templates';

interface PageProps {
  template: ResolvedTemplate;
  content: PageContent;
}

export default function DynamicPage({ template, content }: PageProps) {
  return (
    <TemplateRenderer 
      template={template}
      content={content}
    />
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const resolver = new TemplateResolverImpl();
  const template = await resolver.resolveTemplate(params.templateId);
  
  return {
    props: {
      template,
      content: await fetchContent(params.slug)
    },
    revalidate: 60
  };
};
```

#### 2. Template Renderer Component

```typescript
interface TemplateRendererProps {
  template: ResolvedTemplate;
  content: PageContent;
}

function TemplateRenderer({ template, content }: TemplateRendererProps) {
  return (
    <div className="template-root">
      {template.layout.map((section, index) => (
        <TemplateSectionRenderer
          key={index}
          section={section}
          content={content}
        />
      ))}
    </div>
  );
}
```

### Best Practices

#### 1. Template Development
- Create base templates for common layouts
- Use inheritance for variations
- Keep components focused and reusable
- Document component props thoroughly

#### 2. Performance Optimization
- Implement template caching
- Use incremental static regeneration
- Optimize component re-renders
- Lazy load non-critical components

#### 3. Error Handling
- Validate template structure
- Provide fallback components
- Log template resolution errors
- Handle missing content gracefully

### Testing

#### 1. Unit Tests

```typescript
describe('TemplateResolver', () => {
  it('should resolve template with inheritance', async () => {
    const resolver = new TemplateResolverImpl();
    const template = await resolver.resolveTemplate('test-template');
    
    expect(template).toHaveProperty('layout');
    expect(template.layout).toBeInstanceOf(Array);
  });
});
```

#### 2. Integration Tests

```typescript
describe('Template System Integration', () => {
  it('should render inherited template correctly', async () => {
    const page = await renderPage({
      template: 'blog-template',
      content: mockContent
    });
    
    expect(page).toContainElement('[data-testid="hero-section"]');
    expect(page).toContainElement('[data-testid="blog-content"]');
  });
});
```

## API Reference

### Template Endpoints

#### GET /api/templates
Retrieve all templates

#### GET /api/templates/:id
Retrieve specific template

#### GET /api/template-inheritance
Retrieve all inheritance relationships

#### POST /api/template-inheritance
Create new inheritance relationship

### Component Endpoints

#### GET /api/components
Retrieve all registered components

#### GET /api/components/:type
Retrieve components by type

## Related Documentation
- See `template_system_manual.md` for user documentation
- See `template_quickstart_guide.md` for quick start guide
- See `cms_content_strategy.md` for content strategy

## Revision History
- [2025-01-19] Initial technical reference creation

# 🔧 Strapi Component Integration Guide: Resolving Component Normalization & Rendering Issues

## 🎯 Purpose
This guide provides a comprehensive walkthrough of how to resolve component normalization and rendering issues when integrating Strapi CMS components with a Next.js frontend. It covers common issues and their solutions, with a focus on component type mapping and data normalization.

## 🔍 Common Issues & Solutions

### 1. Component Namespace Handling

#### Problem
Strapi sends components with namespaces (e.g., `page-blocks.hero`), but the frontend expects non-namespaced components (e.g., `hero`).

#### Solution
1. Update the normalizer to handle namespaced components:
```typescript
function normalizeLayoutComponent(raw: any): PageComponent | null {
  // Extract base component type from namespaced type
  const fullType = raw.__component;
  const componentType = fullType.split('.').pop() || '';

  // Map to internal component type
  switch (componentType) {
    case 'hero':
      return {
        id: String(raw.id),
        __component: 'hero',
        title: raw.title
      };
    case 'text-block':
      return {
        id: String(raw.id),
        __component: 'text-block',
        content: raw.content,
        alignment: raw.alignment
      };
    // Add other component types as needed
  }
  return null;
}
```

2. Update ComponentRegistry to handle both namespaced and non-namespaced components:
```typescript
function getComponentType(component: PageComponent): string {
  // Handle both namespaced and non-namespaced components
  return component.__component.split('.').pop() || component.__component;
}

switch (getComponentType(component)) {
  case 'hero':
    return <HeroComponent {...component} />;
  case 'text-block':
    return <TextBlockComponent {...component} />;
}
```

### 2. API Population Parameters

#### Problem
Complex populate parameters can cause 400 Bad Request errors.

#### Solution
Use a simplified populate structure:
```typescript
const getPageQuery = (slug: string) => ({
  filters: {
    slug: {
      $eq: slug
    }
  },
  populate: '*'  // Start with this for basic population
});

// For more complex needs:
const advancedPopulate = {
  populate: {
    layout: {
      populate: '*'
    },
    seo_metadata: true,
    featuredImage: true
  }
};
```

### 3. Type Safety & Validation

#### Problem
Inconsistent type checking leads to runtime errors.

#### Solution
1. Define strict interfaces for component types:
```typescript
interface BaseComponent {
  id: string;
  __component: string;
}

interface HeroComponent extends BaseComponent {
  __component: 'hero';
  title: string;
  subtitle?: string;
}

interface TextBlockComponent extends BaseComponent {
  __component: 'text-block';
  content: string;
  alignment: 'left' | 'center' | 'right';
}

type PageComponent = HeroComponent | TextBlockComponent;
```

2. Implement type guards:
```typescript
function isHeroComponent(component: any): component is HeroComponent {
  return (
    component &&
    component.__component === 'hero' &&
    typeof component.title === 'string'
  );
}

function isTextBlockComponent(component: any): component is TextBlockComponent {
  return (
    component &&
    component.__component === 'text-block' &&
    typeof component.content === 'string' &&
    ['left', 'center', 'right'].includes(component.alignment)
  );
}
```

## 🚀 Implementation Steps

1. **Update Content Type in Strapi**
   - Create component types with appropriate fields
   - Set up dynamic zones for layout
   - Configure component permissions

2. **Update Frontend Types**
   ```typescript
   // types.ts
   export interface StrapiResponse<T> {
     data: T[];
     meta: {
       pagination: {
         page: number;
         pageSize: number;
         pageCount: number;
         total: number;
       };
     };
   }

   export interface PageData {
     id: number;
     Title: string;
     slug: string;
     layout: PageComponent[];
     // ... other fields
   }
   ```

3. **Implement Normalizer**
   ```typescript
   export function normalizePage(raw: StrapiResponse<PageData>): Page {
     const pageData = raw.data[0];
     return {
       id: pageData.id,
       title: pageData.Title,
       slug: pageData.slug,
       layout: pageData.layout.map(normalizeLayoutComponent).filter(Boolean),
       // ... normalize other fields
     };
   }
   ```

4. **Update ComponentRegistry**
   ```typescript
   export function ComponentRegistry({ component }: { component: PageComponent }) {
     const type = getComponentType(component);
     
     switch (type) {
       case 'hero':
         return <HeroComponent {...(component as HeroComponent)} />;
       case 'text-block':
         return <TextBlockComponent {...(component as TextBlockComponent)} />;
       default:
         console.warn(`Unknown component type: ${type}`);
         return null;
     }
   }
   ```

## 🔎 Testing & Verification

1. **Test Component Rendering**
   - Create a test page in Strapi
   - Add various component types
   - Verify rendering in frontend

2. **Verify API Response**
   - Check network tab for API requests
   - Verify populate parameters work
   - Confirm data structure matches types

3. **Monitor Error Handling**
   - Check console for component warnings
   - Verify invalid components are handled gracefully
   - Test error boundary functionality

## 📋 Checklist for New Components

When adding a new component type:

1. [ ] Create component in Strapi
2. [ ] Add component interface in types.ts
3. [ ] Update normalizer function
4. [ ] Add component to ComponentRegistry
5. [ ] Create React component
6. [ ] Add type guard function
7. [ ] Test rendering
8. [ ] Update documentation

## 🚨 Troubleshooting

Common issues and solutions:

1. **400 Bad Request**
   - Check populate parameter structure
   - Verify API endpoint URL
   - Confirm authentication token

2. **Component Not Rendering**
   - Check component namespace handling
   - Verify type guard implementation
   - Confirm component registration

3. **Type Errors**
   - Update component interfaces
   - Check normalizer implementation
   - Verify component props

## 📚 References

- [Strapi API Documentation](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html)
- [Next.js Dynamic Components](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🔄 Maintenance

- Regularly update component documentation
- Monitor error logs for component issues
- Keep type definitions in sync with Strapi
- Review and update component tests

Remember to update this guide when making significant changes to the component system or when adding new patterns for component handling.

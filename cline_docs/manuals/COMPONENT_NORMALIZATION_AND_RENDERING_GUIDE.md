# 🔍 STRAPI CMS COMPONENT NORMALIZATION AND RENDERING GUIDE

## Overview
This guide provides a comprehensive walkthrough of how to handle component normalization and rendering when working with Strapi CMS components in our Next.js frontend. It addresses common issues with component type mismatches, namespace handling, and component registration.

## Key Concepts

### 1. Component Structure from Strapi
Strapi sends components with a namespaced structure:
```json
{
  "__component": "page-blocks.hero",
  "id": "123",
  "title": "Example Title"
}
```

### 2. Component Normalization Process
Components go through a two-step process:
1. **Normalization**: Converting Strapi's raw format to our internal format
2. **Registration**: Mapping normalized components to React components

## Common Issues and Solutions

### 1. Component Namespace Handling

#### Problem
Strapi sends components with namespaces (e.g., "page-blocks.hero"), but our frontend expects simple types (e.g., "hero").

#### Solution
```typescript
// In normalizers.ts
function normalizeLayoutComponent(rawComponent: unknown) {
  const componentType = rawComponent.__component.replace('page-blocks.', '');
  
  switch (componentType) {
    case 'hero':
      return {
        id: String(rawComponent.id),
        __component: 'hero',
        title: String(rawComponent.title),
        // ... other properties
      };
    // ... other cases
  }
}
```

### 2. Component Type Safety

#### Problem
TypeScript errors when converting raw component data to typed components.

#### Solution
```typescript
// Add type guards and proper type assertions
if (!('id' in rawComponent) || !('title' in rawComponent)) {
  console.warn('Invalid hero component: missing required fields');
  return undefined;
}

return {
  id: String(rawComponent.id),
  __component: 'hero' as const,
  title: String(rawComponent.title)
};
```

### 3. Component Registry Flexibility

#### Problem
ComponentRegistry needs to handle both namespaced and non-namespaced components.

#### Solution
```typescript
// In ComponentRegistry.tsx
export function ComponentRegistry({ component }) {
  const componentType = component.__component.replace('page-blocks.', '');

  switch (componentType) {
    case 'hero':
      return <HeroComponent data={component} />;
    case 'text-block':
      return <TextBlock data={component} />;
    // ... other cases
  }
}
```

## Implementation Steps

1. **Update Types**
   ```typescript
   // In types.ts
   export type PageComponentType = 'hero' | 'text-block' | 'gallery' | 'features' | 'button';
   
   export interface BaseComponent {
     id: string;
     __component: string;
   }
   ```

2. **Normalize Components**
   ```typescript
   // In normalizers.ts
   export function normalizePage(raw: StrapiRawPage): Page {
     return {
       // ... other properties
       layout: raw.layout
         ?.map(normalizeLayoutComponent)
         .filter((component): component is NonNullable<typeof component> => component !== undefined)
     };
   }
   ```

3. **Register Components**
   ```typescript
   // In ComponentRegistry.tsx
   export function ComponentRegistry({ component, className }) {
     const componentType = component.__component.replace('page-blocks.', '');
     
     switch (componentType) {
       case 'hero':
         return <HeroComponent data={component} className={className} />;
       // ... other cases
     }
   }
   ```

## Best Practices

1. **Always validate component data**
   - Check for required fields
   - Use type guards
   - Provide meaningful error messages

2. **Handle namespaces consistently**
   - Either strip namespaces during normalization
   - Or maintain them throughout the application
   - Be consistent with your approach

3. **Error Boundaries**
   - Wrap each component type with an error boundary
   - Provide fallback UI
   - Log errors for debugging

## Troubleshooting

### Component Not Rendering
1. Check the component namespace in Strapi
2. Verify normalization is handling the namespace correctly
3. Ensure ComponentRegistry has a matching case
4. Check component type definitions

### Type Errors
1. Verify component interface matches Strapi structure
2. Add proper type guards
3. Use type assertions when necessary
4. Update type definitions if needed

## Testing

1. **Component Normalization**
   ```typescript
   test('normalizes hero component correctly', () => {
     const raw = {
       __component: 'page-blocks.hero',
       id: '123',
       title: 'Test'
     };
     const normalized = normalizeLayoutComponent(raw);
     expect(normalized.__component).toBe('hero');
   });
   ```

2. **Component Rendering**
   ```typescript
   test('renders hero component', () => {
     const component = {
       __component: 'hero',
       id: '123',
       title: 'Test'
     };
     render(<ComponentRegistry component={component} />);
     expect(screen.getByText('Test')).toBeInTheDocument();
   });
   ```

## Related Documentation
- [Strapi Component System](https://docs.strapi.io/dev-docs/backend-customization/models#components)
- [Next.js Dynamic Components](https://nextjs.org/docs/advanced-features/dynamic-import)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)

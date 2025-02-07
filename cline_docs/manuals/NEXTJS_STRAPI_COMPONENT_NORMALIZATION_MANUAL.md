# Next.js + Strapi Component Normalization and Rendering Implementation Manual

## Purpose
This manual provides a comprehensive guide for implementing component normalization and rendering in a Next.js application using Strapi as a headless CMS. It details the complete process from data fetching to component rendering, including error handling and performance monitoring.

## Table of Contents

1. [Project Context](#1-project-context)
2. [File Structure Overview](#2-file-structure-overview)
3. [Problem Areas and Solutions](#3-problem-areas-and-solutions)
4. [Implementation Steps](#4-implementation-steps)
5. [Error Handling](#5-error-handling)
6. [Performance Monitoring](#6-performance-monitoring)
7. [Current Status](#7-current-status)
8. [Next Steps](#8-next-steps)
9. [Additional Resources](#9-additional-resources)

## 1. Project Context

### Technology Stack
- Frontend: Next.js with TypeScript
- CMS: Strapi (Headless CMS)
- Architecture: App Router structure
- Server: Ubuntu with Nginx and PM2

### Integration Goals
- Fetch content from Strapi CMS
- Normalize component data
- Render dynamic components (hero, text block, button, etc.)
- Monitor performance and handle errors

## 2. File Structure Overview

### Key Files
- `normalizers.ts`: Data normalization functions
- `ComponentRegistry.tsx`: Dynamic component registration/rendering
- `api.ts`: Next.js API logic
- `PerformanceMonitor.tsx`: Performance tracking
- `monitoringService.ts`: Error and performance logging

## 3. Problem Areas and Solutions

### 3.1 Content Access Issues
- **Problem**: 404 errors and permission issues
- **Solution**: 
  - Configure Strapi Public Role permissions
  - Verify correct slug usage
  - Enable find/findOne permissions for Page content type

### 3.2 Data Population
- **Problem**: 400 Bad Request errors with complex populate parameters
- **Solution**: 
  - Simplified populate strategy using populate='*'
  - Structured population parameters
  - Proper URLSearchParams handling

### 3.3 Component Normalization
- **Problem**: Namespace conflicts and attribute mapping
- **Solution**: 
  - Strip 'page-blocks.' prefix
  - Implement proper type definitions
  - Create normalized component mapping

### 3.4 Performance Monitoring
- **Problem**: Runtime errors in metrics collection
- **Solution**: 
  - Add null checks
  - Implement default values
  - Proper error tracking integration

## 4. Implementation Steps

### 4.1 Strapi Configuration
1. Access Strapi admin panel
2. Navigate to Settings → Roles → Public
3. Enable find/findOne permissions for Page content type
4. Configure content type fields:
   - Title (Text)
   - slug (UID)
   - seoTitle (Text)
   - seoDescription (Text)
   - seoKeywords (Text)
   - featuredImage (Media)
   - layout (Dynamic zone)
   - publicationDate (DateTime)

### 4.2 Data Normalization
```typescript
// normalizers.ts
export const normalizePage = (data: StrapiRawPage) => {
  return {
    title: data.Title,
    slug: data.slug,
    seo: {
      title: data.seoTitle,
      description: data.seoDescription,
      keywords: data.seoKeywords
    },
    // ... additional normalization
  };
};

export const normalizeComponent = (component: any) => {
  const type = component.__component.replace('page-blocks.', '');
  return {
    type,
    // ... component-specific normalization
  };
};
```

### 4.3 Component Registry
```typescript
// ComponentRegistry.tsx
const ComponentRegistry = {
  'hero': HeroComponent,
  'text-block': TextBlockComponent,
  'button': ButtonComponent,
  // ... additional components
};

export const renderComponent = (type: string, props: any) => {
  const Component = ComponentRegistry[type] || UnknownComponent;
  return <Component {...props} />;
};
```

### 4.4 API Integration
```typescript
// api.ts
export const getPage = async (slug: string) => {
  const response = await fetch(`${API_URL}/api/pages?filters[slug]=${slug}&populate=*`, {
    headers: {
      // ... headers configuration
    }
  });
  
  const data = await response.json();
  return normalizePage(data.data);
};
```

## 5. Error Handling

### Error Tracking Implementation
```typescript
// monitoringService.ts
export const trackError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  // ... additional error tracking logic
};
```

### Common Error Scenarios
1. 404 Not Found
   - Check slug existence
   - Verify API endpoint
2. 400 Bad Request
   - Validate populate parameters
   - Check request formatting
3. Component Type Errors
   - Verify component registry mapping
   - Check normalization process

## 6. Performance Monitoring

### Metrics Collection
```typescript
// PerformanceMonitor.tsx
const getMetrics = () => {
  const data = monitoringService.getLatestMetrics();
  return data?.value ?? defaultValue;
};
```

### Implementation Considerations
- Add null checks for undefined metrics
- Implement default values
- Handle edge cases in data formatting

## 7. Current Status

### Working Features
- Dynamic component rendering
- Data normalization pipeline
- Error tracking system
- Performance monitoring

### Known Limitations
- Limited component types
- Basic SEO implementation
- Simple caching strategy

## 8. Next Steps

### Recommended Improvements
1. Expand component library
2. Enhance SEO capabilities
3. Implement advanced caching
4. Add automated testing
5. Optimize performance metrics

## 9. Additional Resources

### Documentation Links
- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Internal References
- Error Log: `errorlog.md`
- Project Roadmap: `projectRoadmap.md`
- Codebase Summary: `codebaseSummary.md`

## Revision History
- **Date:** 2025-01-21
- **Description:** Initial creation of comprehensive manual
- **Author:** AI Assistant

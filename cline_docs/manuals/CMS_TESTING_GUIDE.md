# CMS Testing Guide

## Overview
This guide provides detailed instructions for creating test content in the Strapi CMS to verify frontend rendering and functionality.

## Access Information
- Strapi Admin URL: http://153.92.223.23:1337/admin
- Frontend Dev URL: http://localhost:3000

## Test Content Guidelines

### General Rules
1. Use descriptive titles prefixed with "TEST:"
2. Include all possible fields for thorough testing
3. Test both required and optional fields
4. Use realistic content lengths and formats
5. Include special characters to test encoding
6. Test maximum length constraints where applicable

### Component Test Cases

#### Hero Component
```json
{
  "title": "TEST: Hero with All Features",
  "subtitle": "Testing subtitle with special characters: åéî",
  "backgroundImage": "Upload test image (1920x1080)",
  "ctaButton": {
    "text": "Test CTA",
    "link": "/test-page",
    "style": "primary"
  }
}
```

#### Text Block
```json
{
  "content": "TEST: Text block with formatting...",
  "alignment": "Test all: left, center, right"
}
```

#### Image Gallery
```json
{
  "layout": "Test all: grid, carousel, masonry",
  "images": "Upload 3-5 test images of varying sizes"
}
```

#### Feature Grid
```json
{
  "features": [
    {
      "title": "TEST: Feature 1",
      "description": "Test description",
      "icon": "Upload test icon",
      "link": "/test-link"
    }
  ]
}
```

### Content Type Test Cases

#### Blog Post
```json
{
  "title": "TEST: Comprehensive Blog Post",
  "content": "Test content with headings, lists, links...",
  "summary": "Test summary text",
  "author": "Test Author",
  "categories": ["Test Category 1", "Test Category 2"],
  "tags": ["test", "verification"],
  "seoTitle": "Test SEO Title",
  "seoDescription": "Test SEO Description",
  "seoKeywords": "test, cms, verification"
}
```

#### News Article
```json
{
  "title": "TEST: Full News Article",
  "content": "Test news content...",
  "summary": "Test news summary",
  "categories": ["Test News Category"],
  "featuredImage": "Upload test featured image"
}
```

#### Navigation Menu
```json
{
  "title": "TEST: Main Menu",
  "type": "main",
  "items": [
    {
      "title": "Test Item",
      "type": "internal",
      "path": "/test",
      "children": [
        {
          "title": "Test Submenu",
          "path": "/test/sub"
        }
      ]
    }
  ]
}
```

## Testing Process

1. Basic Components
   - Create each component type
   - Test all possible field combinations
   - Verify frontend rendering
   - Test responsive behavior

2. Complex Content
   - Create full pages with multiple components
   - Test component interactions
   - Verify layout integrity
   - Test navigation flow

3. Media Handling
   - Test various image sizes
   - Verify image optimization
   - Test alternative text display
   - Verify responsive images

4. Error Cases
   - Test missing optional fields
   - Test maximum content lengths
   - Test invalid input handling
   - Verify error messages

## Verification Checklist

### Visual Verification
- [ ] Components render correctly
- [ ] Images load properly
- [ ] Typography is consistent
- [ ] Spacing is correct
- [ ] Responsive design works
- [ ] Animations function properly

### Functional Verification
- [ ] Links work correctly
- [ ] Navigation is functional
- [ ] Forms submit properly
- [ ] Search functionality works
- [ ] Filtering operates correctly
- [ ] Pagination functions properly

### Content Verification
- [ ] All text is readable
- [ ] Images have alt text
- [ ] SEO fields are populated
- [ ] Metadata is correct
- [ ] Categories/tags work
- [ ] Related content links work

## Issue Reporting

When finding issues:
1. Document the exact content type and component
2. Note the specific fields involved
3. Describe the expected vs actual behavior
4. Include screenshots if relevant
5. Add to errorLog.md with proper formatting

## Last Updated: 2025-01-24
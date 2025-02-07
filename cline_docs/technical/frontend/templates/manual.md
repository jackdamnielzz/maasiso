# Template System User Manual
Last Updated: 2025-01-19

## Overview

The MaasISO CMS uses a sophisticated template system that combines reusable components, inheritance, and customization capabilities. This manual explains how to work with templates effectively.

## Template Types

### 1. Page Templates
Base templates for different types of pages.

#### Available Templates:
- **Standard Content Page**
  - Default template for general content
  - Components:
    * Hero section
    * Text Block
    * Feature-grid
  - Usage: General content pages, landing pages

- **Blog Content Page**
  - Inherits from Standard Content Page
  - Additional blog-specific features
  - Usage: Blog posts, articles

### 2. Section Templates
Reusable section layouts that can be included in page templates.

#### Available Sections:
- Contact Section
- Header Section
- Footer Section

### 3. Layout Presets
Pre-configured layout structures for common page arrangements.

## Template Inheritance System

### How It Works
1. Parent Template (e.g., Standard Content Page)
   - Defines base structure
   - Contains common components
   - Sets default layouts

2. Child Template (e.g., Blog Content Page)
   - Inherits base structure
   - Can override specific sections
   - Adds template-specific components

3. Inheritance Rules
   - Components can be:
     * Inherited as-is
     * Modified with new settings
     * Completely replaced
     * Extended with additional content

### Setting Up Template Inheritance

1. Create Template Inheritance Entry:
   - Navigate to Content Manager → Template Inheritance
   - Click "Create new entry"
   - Fill in:
     * Name (descriptive title)
     * Description
     * Parent Template selection
     * Child Template selection
     * Override settings (JSON)
     * Active status

2. Override Configuration:
```json
{
  "layout": {
    "section-name": {
      "inherit": true|false,
      "modifications": {
        "component-name": {
          "setting": "value"
        }
      }
    }
  }
}
```

## Components

### Page Blocks
1. **Button**
   - Properties:
     * text
     * link
     * style

2. **Feature-grid**
   - Properties:
     * features (repeatable)
     * layout options

3. **Hero**
   - Properties:
     * title
     * subtitle
     * backgroundImage
     * ctaButton

4. **Image-gallery**
   - Properties:
     * images
     * layout

5. **Text Block**
   - Properties:
     * content
     * alignment

### Shared Components
1. **Cta-button**
   - Properties:
     * text
     * link
     * style

2. **Feature**
   - Properties:
     * title
     * description
     * icon
     * link

## Best Practices

1. Template Selection
   - Use Standard Content Page for general content
   - Inherit for specific content types
   - Create new templates sparingly

2. Component Usage
   - Reuse shared components
   - Maintain consistent styling
   - Follow naming conventions

3. Inheritance Management
   - Document inheritance relationships
   - Test inherited templates
   - Maintain override documentation

## Related Documentation
- See `cms_content_strategy.md` for overall content strategy
- See `cms_implementation_progress.md` for implementation status
- See `techStack.md` for technical details

## Troubleshooting

### Common Issues
1. Template not inheriting properly
   - Check inheritance entry is active
   - Verify JSON syntax in overrides
   - Confirm parent template exists

2. Components not displaying
   - Check component configuration
   - Verify required fields
   - Check media references

### Support
For technical support:
1. Check error logs
2. Review configuration
3. Contact system administrator

## Revision History
- [2025-01-19] Initial manual creation
- [2025-01-19] Added template inheritance documentation
- [2025-01-19] Added component reference guide

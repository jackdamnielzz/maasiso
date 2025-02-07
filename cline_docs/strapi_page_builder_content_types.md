# Dynamic Page Builder Content Types

## Page Content Type

1. Base Page
   - Field Name: `title`
   - Type: String
   - Required: true
   - Description: Page title for SEO and navigation

   - Field Name: `slug`
   - Type: String (UID)
   - Required: true
   - Description: URL-friendly identifier

   - Field Name: `seoMetadata`
   - Type: Component
   - Fields within component:
     - `metaTitle` (String)
     - `metaDescription` (Text)
     - `keywords` (Text)
     - `ogImage` (Media)

   - Field Name: `layout`
   - Type: Dynamic Zone
   - Description: Flexible content zones that can contain any content component
   - Allowed components: All content block components

2. Page Status
   - Field Name: `status`
   - Type: Enumeration
   - Values: ['draft', 'published', 'archived']
   - Default: 'draft'
   - Required: true

   - Field Name: `publishedAt`
   - Type: DateTime
   - Description: When the page was/will be published

## Content Block Components

1. Hero Component
   - Field Name: `title`
   - Type: String
   - Required: true

   - Field Name: `subtitle`
   - Type: Text

   - Field Name: `backgroundImage`
   - Type: Media
   
   - Field Name: `ctaButton`
   - Type: Component
   - Fields within component:
     - `text` (String)
     - `link` (String)
     - `style` (Enumeration: ['primary', 'secondary'])

2. Text Block Component
   - Field Name: `content`
   - Type: Rich Text
   - Required: true

   - Field Name: `alignment`
   - Type: Enumeration
   - Values: ['left', 'center', 'right']
   - Default: 'left'

3. Image Gallery Component
   - Field Name: `images`
   - Type: Media (multiple)
   - Required: true

   - Field Name: `layout`
   - Type: Enumeration
   - Values: ['grid', 'carousel', 'masonry']
   - Default: 'grid'

4. Feature Grid Component
   - Field Name: `features`
   - Type: Component (repeatable)
   - Fields within component:
     - `title` (String)
     - `description` (Text)
     - `icon` (Media)
     - `link` (String)

## Navigation System Content Types

1. Menu Collection Type
   - Field Name: `title`
   - Type: String
   - Required: true
   - Description: Menu name (e.g., "Main Navigation", "Footer Menu")

   - Field Name: `handle`
   - Type: String (UID)
   - Required: true
   - Description: Unique identifier for the menu (e.g., "main-nav", "footer")

   - Field Name: `type`
   - Type: Enumeration
   - Values: ['main', 'footer', 'legal', 'social']
   - Required: true
   - Description: Determines menu type and rendering style

   - Field Name: `items`
   - Type: Relation (hasMany)
   - Target: MenuItem
   - Description: Links to menu items in this menu

   - Field Name: `position`
   - Type: Component
   - Fields within component:
     - `location` (Enumeration: ['header', 'footer', 'sidebar'])
     - `order` (Integer)
     - `style` (Enumeration: ['default', 'mega-menu', 'dropdown', 'horizontal', 'vertical'])
     - `className` (String, optional for custom styling)

2. MenuItem Collection Type
   - Field Name: `title`
   - Type: String
   - Required: true
   - Description: Display text for the menu item

   - Field Name: `type`
   - Type: Enumeration
   - Values: ['internal', 'external', 'dropdown']
   - Required: true
   - Description: Determines link behavior

   - Field Name: `path`
   - Type: String
   - Required: true
   - Description: URL path or external URL

   - Field Name: `parent`
   - Type: Relation
   - Target: MenuItem
   - Description: Parent menu item for nested structure

   - Field Name: `menu`
   - Type: Relation
   - Target: Menu
   - Required: true
   - Description: The menu this item belongs to

   - Field Name: `children`
   - Type: Relation
   - Target: MenuItem
   - Description: Child menu items for dropdowns

   - Field Name: `settings`
   - Type: Component
   - Fields within component:
     - `order` (Integer)
     - `icon` (Media)
     - `openInNewTab` (Boolean)
     - `highlight` (Boolean)
     - `className` (String)

3. MenuSection Component (for Footer)
   - Field Name: `title`
   - Type: String
   - Required: true
   - Description: Section heading

   - Field Name: `items`
   - Type: Relation
   - Target: MenuItem
   - Description: Menu items in this section

   - Field Name: `order`
   - Type: Integer
   - Description: Display order in footer

4. MenuVisibility Component
   - Field Name: `roles`
   - Type: Relation
   - Target: Role
   - Description: User roles that can see this item

   - Field Name: `devices`
   - Type: Enumeration (multiple)
   - Values: ['desktop', 'tablet', 'mobile']
   - Description: Device types where item is shown

   - Field Name: `scheduling`
   - Type: Component
   - Fields within component:
     - `startDate` (DateTime)
     - `endDate` (DateTime)
     - `isActive` (Boolean)

5. SocialLink Component
   - Field Name: `platform`
   - Type: String
   - Required: true
   - Description: Social media platform name

   - Field Name: `url`
   - Type: String
   - Required: true
   - Description: Social media profile URL

   - Field Name: `icon`
   - Type: Media
   - Description: Platform icon

   - Field Name: `order`
   - Type: Integer
   - Description: Display order

## Implementation Steps

1. Create Base Content Types
   - [ ] Create Page content type
   - [ ] Set up SEO component
   - [ ] Configure layout Dynamic Zone

2. Create Content Block Components
   - [ ] Hero component
   - [ ] Text block component
   - [ ] Image gallery component
   - [ ] Feature grid component

3. Create Navigation Structure
   - [ ] Menu content type
   - [ ] Menu item component
   - [ ] Menu visibility settings

4. Configure Permissions
   - [ ] Set up role-based access
   - [ ] Configure public access for published content
   - [ ] Set up admin-only draft access

## Next Steps After Creation

1. Frontend Integration
   - [ ] Create TypeScript interfaces for all content types
   - [ ] Set up GraphQL queries
   - [ ] Implement dynamic routing based on page slugs
   - [ ] Create React components for each content block

2. Preview System
   - [ ] Implement draft preview functionality
   - [ ] Set up real-time preview updates
   - [ ] Create preview mode toggle

## Notes
- All components should support responsive design configurations
- Navigation items should support nested structures for dropdown menus
- Content blocks should be reusable across multiple pages
- Consider implementing versioning for pages

## Revision History
- **Date:** 2025-01-15
- **Description:** Initial content type structure for Dynamic Page Builder
- **Author:** AI

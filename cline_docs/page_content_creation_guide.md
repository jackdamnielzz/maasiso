# Complete Guide to Creating Page Content in MaasISO

## Important Update (2024-01-21)
```yaml
Status: Tijdelijk Beperkte Functionaliteit
Reden: Technische updates in uitvoering

Huidige Beperkingen:
1. Environment Variables
   - API connectie mogelijk onderbroken
   - Tijdelijke workaround: Contact systeembeheer

2. Dynamic Routes
   - Nieuwe pagina's mogelijk niet direct zichtbaar
   - Tijdelijke workaround: Cache wissen en pagina verversen

3. Cache Systeem
   - Content updates mogelijk vertraagd
   - Tijdelijke workaround: Hard refresh (Ctrl+F5)

Verwachte Oplossing: 2-3 werkdagen
Voor assistentie: Contact systeembeheer
```

# Complete Guide to Creating Page Content in MaasISO

## Overview
This guide explains step-by-step how to create and manage content for specific pages using the MaasISO Content Management System (CMS). The system uses a dynamic page builder that allows you to create custom pages with various components that automatically appear on the website - no coding required!

### Automatic Page Creation
The website is built to automatically create new pages when you publish them in the CMS. Here's how it works:

1. You create a new page in the CMS and give it a URL slug (e.g., "about-us")
2. When you publish the page, it becomes immediately available at yourdomain.com/about-us
3. The website's dynamic routing system automatically:
   - Detects the new page
   - Creates the URL route
   - Loads the content
   - Renders the components you selected
   - No developer intervention needed!

### How Pages Connect to the Website
1. CMS to Website Connection:
   - Pages in CMS have a unique "slug" (URL path)
   - Website automatically routes these slugs to pages
   - Components are dynamically loaded based on your layout
   - Changes appear instantly when published

2. Content to Page Mapping:
   - Each page in CMS = A URL on the website
   - Components appear in the order you arrange them
   - SEO settings automatically applied
   - Navigation menus update automatically

### How Pages Work
1. Each page in the CMS becomes a URL on the website
   - Example: If you create a page with slug "about-us", it becomes accessible at yourdomain.com/about-us
   - No need to create or modify code files
   - Changes take effect immediately when published

2. Pages are built using components:
   - Hero sections for main banners
   - Text blocks for content
   - Image galleries for visual content
   - Feature grids for highlighting key points
   - All components are pre-built and ready to use

3. Component Management:
   - Components can be arranged in any order
   - Drag and drop to reorganize
   - Add or remove components instantly
   - Preview changes before publishing

4. Automatic Features:
   - Pages are responsive on all devices
   - SEO metadata is automatically applied
   - Navigation menus update automatically
   - Performance optimization built-in

## Accessing the CMS
1. Open your web browser and navigate to: http://153.92.223.23:1337/admin
2. Log in with your provided credentials
3. You'll land on the Strapi dashboard

## Understanding Page Structure
Each page in MaasISO consists of:

1. Basic Page Information
   - Title: The page title (appears in browser tab and search results)
   - URL slug: The page's URL path (automatically generated from title but can be customized)
   - SEO metadata: Information for search engines and social sharing
     * Meta title (max 60 characters)
     * Meta description (max 160 characters)
     * Keywords
     * Social sharing image

2. Layout Components
   These components appear on the page in the order you arrange them:

   a) Hero Component
      - Full-width banner section
      - Can include background image
      - Title and subtitle
      - Optional call-to-action button
      - Best for: Page headers, main banners

   b) Text Block Component
      - Rich text content
      - Supports formatting (bold, italic, lists)
      - Can be aligned left/center/right
      - Best for: Main content, descriptions

   c) Image Gallery Component
      - Multiple image display
      - Three layout options:
        * Grid: Uniform grid layout
        * Carousel: Scrollable slideshow
        * Masonry: Pinterest-style layout
      - Best for: Portfolio, product showcases

   d) Feature Grid Component
      - Grid of feature boxes
      - Each feature has:
        * Title
        * Description
        * Icon
        * Optional link
      - Best for: Services, features, team members

## Step-by-Step: Creating a New Page

### 1. Create a New Page
1. Access the CMS:
   - Open your browser and go to http://153.92.223.23:1337/admin
   - Log in with your credentials

2. Create New Page:
   - Click "Content Manager" in left sidebar
   - Select "Page" from collection types
   - Click "Create new entry"

3. Fill in Basic Information:
   - Title: Enter your page title
     * Use clear, descriptive titles
     * Example: "About Our Company" rather than just "About"
   
   - Slug: The URL path will auto-generate
     * Can be customized if needed
     * Use lowercase letters, numbers, and hyphens
     * Example: "about-our-company"
   
   - SEO Metadata:
     * Meta title: Optimized for search results (max 60 chars)
     * Meta description: Brief page summary (max 160 chars)
     * Keywords: Relevant search terms
     * OG Image: Image shown when shared on social media (1200x630px recommended)

### 2. Adding Content Components
Build your page by adding and arranging components. Each component serves a specific purpose:

#### Hero Component
1. Add Hero:
   - In Layout section, click "Add component"
   - Select "Hero Component"
   - This will typically be your first component

2. Configure Hero:
   - Title: Main heading (keep it impactful)
   - Subtitle: Supporting text (optional)
   - Background Image:
     * Upload high-quality image (min 1920x1080px)
     * Use JPG/PNG format
     * Optimize for web
   
   - CTA (Call to Action) Button:
     * Button Text: Clear action words (e.g., "Learn More", "Contact Us")
     * Link URL: Where button leads (/contact, /services, etc.)
     * Style: Choose primary (highlighted) or secondary (subtle)

3. Hero Best Practices:
   - Keep text concise and clear
   - Use high-contrast images that don't interfere with text
   - Ensure CTA button stands out
   - Test how it looks on mobile devices

#### Text Block Component
1. Add Text Block:
   - Click "Add component"
   - Select "Text Block"
   - Can add multiple text blocks on one page

2. Create Content:
   - Use the rich text editor for formatting
   - Available tools:
     * Headings (H2-H6)
     * Bold and italic
     * Bullet and numbered lists
     * Links
     * Tables
     * Code blocks
   
   - Choose alignment:
     * Left (default, best for reading)
     * Center (good for short, important text)
     * Right (rarely used, specific cases only)

3. Text Block Best Practices:
   - Use headings to structure content
   - Keep paragraphs short (3-4 lines)
   - Include relevant links
   - Use lists for easy scanning
   - Maintain consistent formatting

#### Image Gallery Component
1. Add Gallery:
   - Click "Add component"
   - Select "Image Gallery"
   - Best for showcasing multiple images

2. Upload Images:
   - Select multiple images at once
   - Supported formats: JPG, PNG, WebP
   - Recommended sizes:
     * Landscape: 1200x800px
     * Portrait: 800x1200px
     * Square: 1000x1000px
   
   - Choose Layout:
     * Grid: Even spacing, same-size images
     * Carousel: Scrollable slideshow
     * Masonry: Pinterest-style varied heights

3. Gallery Best Practices:
   - Optimize images for web
   - Use consistent aspect ratios
   - Add alt text for accessibility
   - Consider load time (compress large images)
   - Test gallery on mobile devices

#### Feature Grid Component
1. Add Feature Grid:
   - Click "Add component"
   - Select "Feature Grid"
   - Perfect for services, benefits, or team members

2. Add Features:
   - Click "Add feature" for each item
   - For each feature:
     * Title: Short, clear heading
     * Description: Brief explanation (2-3 lines)
     * Icon: Upload relevant icon (SVG preferred)
     * Link: Optional URL for more information

3. Feature Grid Best Practices:
   - Keep all descriptions similar length
   - Use consistent icon style
   - Limit to 3-6 features per grid
   - Ensure mobile readability
   - Use clear, benefit-focused titles

### 3. Organizing Content
1. Arrange Components:
   - Drag and drop to reorder
   - Consider user flow and story
   - Typical order:
     1. Hero (introduction)
     2. Text Block (main message)
     3. Feature Grid (key points)
     4. Image Gallery (visual proof)
     5. Text Block (call to action)

2. Preview and Test:
   - Use preview function frequently
   - Test on different screen sizes
   - Check all links work
   - Verify image loading
   - Test interactive elements

3. Component Management:
   - Duplicate components when needed
   - Remove unused components
   - Keep page length reasonable
   - Ensure smooth transitions between sections

### 4. Publishing
1. Review Before Publishing:
   - Check all content for errors
   - Verify SEO metadata is complete
   - Test all links and buttons
   - Preview on multiple devices

2. Save and Publish:
   - Click "Save" to store changes
   - Use "Publish" to make page live
   - Note the publication time

3. Post-Publishing:
   - Verify page is accessible at correct URL
   - Check page appears in navigation (if added)
   - Monitor for any issues
   - Share URL with team if needed

4. Maintenance:
   - Regular content updates
   - Monitor page performance
   - Update SEO metadata as needed
   - Keep images and links current

## Page Types and Their Components

### Home Page
Recommended components:
1. Hero Component (welcome message)
2. Feature Grid (key services/features)
3. Text Blocks (company introduction)
4. Image Gallery (showcase work)

### About Page
Recommended components:
1. Hero Component (company story)
2. Text Blocks (detailed information)
3. Feature Grid (team members/values)

### Service/Product Pages
Recommended components:
1. Hero Component (service overview)
2. Text Blocks (detailed description)
3. Feature Grid (benefits/features)
4. Image Gallery (examples/portfolio)

## Navigation and Menu Management

### Adding Page to Navigation
1. Go to "Menu" in the Content Manager
2. Select the appropriate menu (e.g., "Main Navigation")
3. Add new menu item:
   - Title: Display text
   - Type: Internal
   - Path: Your page slug
   - Configure visibility and order

## Best Practices

### Content Organization
1. Plan your page structure before creating content
2. Use consistent component styles across pages
3. Maintain a logical content hierarchy
4. Keep content concise and focused

### SEO Optimization
1. Always fill in SEO metadata
2. Use descriptive page titles
3. Write compelling meta descriptions
4. Include relevant keywords
5. Optimize images with alt text

### Component Usage
1. Don't overload pages with too many components
2. Maintain visual hierarchy
3. Use appropriate spacing between components
4. Ensure content flows logically

## Troubleshooting

### Common Issues
1. Content not appearing on frontend
   - Check if page is published
   - Verify slug is correct
   - Clear browser cache

2. Images not displaying
   - Check image upload was successful
   - Verify image format is supported
   - Check file size limits

3. Layout problems
   - Preview in different screen sizes
   - Check component order
   - Verify content formatting

## Testing Your Pages

### Local Testing
1. Access the CMS:
   - Go to http://153.92.223.23:1337/admin
   - Log in with your credentials
   - Create or edit your page
   - Save changes

2. Preview in CMS:
   - Use the "Preview" button in Strapi
   - Check content appears correctly
   - Test responsive layouts
   - Verify all links work

3. Test on Live Site:
   - After publishing, visit your page URL
   - Example: http://153.92.223.23/about-us
   - Check all components render correctly
   - Test on different devices/browsers

### Content Verification Checklist
1. Page Structure:
   - URL works and is correct
   - All components appear in right order
   - No missing content or images
   - Navigation menu shows new page

2. Component Testing:
   - Hero: Background image loads, text readable
   - Text Blocks: Formatting preserved
   - Image Gallery: All images load
   - Feature Grid: Icons and links work

3. Functionality:
   - All buttons/links clickable
   - Images load properly
   - Forms work (if any)
   - No console errors

4. Mobile Testing:
   - Test on phone/tablet
   - Check responsive layouts
   - Verify touch interactions
   - Test menu navigation

### Troubleshooting Common Issues
1. Page Not Found:
   - Verify page is published
   - Check slug matches URL
   - Clear browser cache
   - Wait a few minutes for changes to propagate

2. Components Missing:
   - Check component is added in CMS
   - Verify required fields are filled
   - Try republishing the page
   - Check browser console for errors

3. Layout Problems:
   - Preview on different screen sizes
   - Check component order in CMS
   - Verify image sizes are correct
   - Test with different browsers

## Getting Help
- Contact system administrator for technical issues
- Refer to content_troubleshooting.md for detailed problem-solving
- Check content_workflow_guide.md for workflow best practices

## Revision History
- **Date:** 2025-01-16
- **Description:** Initial comprehensive guide for page content creation
- **Author:** AI

# MaasISO Content Management System Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Content Types](#content-types)
3. [Content Creation](#content-creation)
4. [Content Management](#content-management)
5. [Publishing Workflow](#publishing-workflow)
6. [Media Library](#media-library)
7. [System Administration](#system-administration)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the CMS
- URL: http://153.92.223.23:1337/admin
- Use your provided credentials to log in
- Ensure you have a stable internet connection

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Minimum screen resolution: 1280x720

### Dashboard Overview
![Dashboard](assets/cms_guide/dashboard.png)

The dashboard is organized into several key areas:
1. Left Sidebar: Contains all content types and system settings
   - Blog Posts
   - News Articles
   - Categories
   - Media Library
   - Settings
2. Main Area: Shows your recent content and quick actions
   - Recently edited entries
   - Recently published entries
   - Quick create buttons
3. Top Bar: Contains user profile and system notifications

### Navigation Tips
- Use the search bar in the left sidebar to quickly find content types
- Click on your profile picture in the top right for account settings
- The bell icon shows system notifications and updates

## Content Types

### Blog Posts
![Blog Post Creation](assets/cms_guide/blog_post_form.png)

Fields available:
1. Title (required)
   - The main title of your blog post
   - Keep it clear and descriptive
   - Will automatically generate the URL slug

2. Content (required)
   - Rich text editor with formatting options
   - Supports images, links, and tables
   - Use headings (H2, H3) for structure
   - Toolbar includes:
     * Bold, Italic, Underline
     * Lists (bulleted and numbered)
     * Links
     * Images
     * Tables
     * Code blocks

3. Author
   - Name of the post author
   - Used for attribution

4. Categories
   - Multiple categories can be selected
   - Click "Add relation" to choose categories
   - Create new categories if needed

5. Tags
   - Keywords for organization
   - Click "Add relation" to select existing tags
   - Type new tags to create them

6. Featured Image
   - Main image displayed at the top
   - Recommended size: 1200x630px
   - Click the upload area or drag and drop

7. SEO Fields
   - SEO Title: Custom title for search engines (max 60 chars)
   - SEO Description: Meta description (max 160 chars)
   - SEO Keywords: Keywords for search optimization

### News Articles
![News Article Creation](assets/cms_guide/news_article_form.png)

Fields available:
1. Title (required)
   - The main title of your news article
   - Should be newsworthy and informative
   - Will automatically generate the URL slug

2. Content (required)
   - Rich text editor with full formatting
   - Write in inverted pyramid style:
     * Most important information first
     * Supporting details
     * Background information
   - Use short paragraphs for readability

3. Author
   - Name of the article author
   - Used for byline

4. Categories
   - Multiple categories can be selected
   - Click "Add relation" to choose
   - Common categories:
     * Company News
     * Industry Updates
     * Press Releases

5. Featured Image
   - Main image for the article
   - Recommended size: 1200x630px
   - Should be relevant to the story

6. Publication Date
   - When the article should go live
   - Can be scheduled for future publication

7. SEO Fields
   - SEO Title: News-focused title (max 60 chars)
   - SEO Description: Brief article summary (max 160 chars)
   - SEO Keywords: Relevant news keywords

### Categories
![Category Management](assets/cms_guide/media_library.png)

Fields available:
1. Name (required)
   - Choose clear, descriptive names
   - Examples:
     * Company News
     * Product Updates
     * Industry Insights
     * Technical Guides

2. Description
   - Brief explanation of the category
   - Helps content creators choose the right category
   - Used for internal reference

3. Slug (auto-generated)
   - URL-friendly version of the name
   - Automatically created from the name
   - Can be manually edited if needed

## Content Creation

### Creating New Content
1. Select the content type from the left sidebar
2. Click the "Create new entry" button
3. Fill in the required fields (marked with *)
4. Save as draft or publish directly

### Rich Text Editor Usage
The editor supports:
- Basic formatting (bold, italic, underline)
- Headings (H1-H6)
- Lists (bulleted and numbered)
- Links
- Images
- Tables
- Code blocks
- Quotes

### Media Management
When adding images:
- Recommended image dimensions:
  - Featured images: 1200x630px
  - Content images: minimum width 800px
- Supported formats: JPG, PNG, WebP
- Maximum file size: 5MB
- Always add alt text for accessibility

### SEO Optimization
For each content piece:
1. Add a descriptive SEO title (max 60 characters)
2. Write a compelling meta description (max 160 characters)
3. Include relevant keywords
4. Use descriptive image alt text

## Content Management

### Content States
1. Draft
   - Content is saved but not publicly visible
   - Can be edited and previewed
   - Only accessible to CMS users
   - No URL generated yet

2. Published
   - Content is live on the website
   - Public URL is active
   - Appears in listings and search
   - Can still be edited

3. Scheduled
   - Content set to publish at a future date/time
   - Automatically transitions to Published state
   - Can be unscheduled if needed
   - Preview available before publication

4. Archived
   - Content no longer active but preserved
   - Not publicly visible
   - Can be restored if needed
   - Maintains version history

### Managing Content
1. Finding Content
   - Use the list view in each content type section
   - Filter by status (draft, published, etc.)
   - Search by title or content
   - Sort by date, title, or status

2. Editing Content
   - Click any entry to open editor
   - All fields can be modified
   - Changes saved automatically
   - Version history available

3. Content Organization
   - Use consistent category names
   - Apply relevant tags
   - Maintain clear naming conventions
   - Regular content audits recommended

4. Bulk Operations
   - Select multiple items
   - Publish/unpublish in bulk
   - Delete multiple items
   - Change categories/tags

## Media Library
![Media Library](assets/cms_guide/media_library.png)

### Accessing the Media Library
1. Click "Media Library" in the left sidebar
2. You'll see all uploaded media assets
3. Use the filters to find specific types of media
4. Switch between grid and list views using the top-right buttons

### Uploading Media
1. Click "Add new assets" button in top-right
2. Either:
   - Click to browse your files
   - Drag and drop files into the upload area
3. Multiple files can be uploaded simultaneously
4. Progress bars show upload status

### File Organization
1. Create folders for different content types:
   - Blog Images
   - News Images
   - Documents
   - Downloads

2. Best practices for filenames:
   - Use lowercase letters
   - Replace spaces with hyphens
   - Include descriptive keywords
   - Example: `company-meeting-january-2025.jpg`

3. File Management:
   - Move files between folders using drag and drop
   - Use the bulk selection tool for multiple files
   - Delete unused media to save space
   - Update file information (alt text, caption) by clicking the edit icon

### Supported File Types
1. Images:
   - JPG/JPEG
   - PNG
   - WebP
   - GIF
   - Maximum size: 5MB
   - Recommended dimensions:
     * Featured images: 1200x630px
     * Content images: minimum width 800px

2. Documents:
   - PDF
   - DOC/DOCX
   - XLS/XLSX
   - Maximum size: 10MB

3. Other Media:
   - ZIP archives
   - Plain text files
   - Maximum size: 20MB

## System Administration

### User Management
- Admin: Full system access
- Editor: Can create and publish content
- Author: Can create but not publish

### System Backup
Database backups are automated:
- Daily backups at midnight
- Stored for 30 days
- Contact system admin for restoration

## Troubleshooting

### Common Issues
1. Cannot save changes
   - Check internet connection
   - Refresh page
   - Try clearing browser cache

2. Images not uploading
   - Check file size
   - Verify file format
   - Ensure good internet connection

### Support Resources
For technical issues:
- Contact: [System Administrator Contact]
- Emergency: [Emergency Contact]

### Emergency Procedures
1. Content needs immediate removal:
   - Access content
   - Click "Unpublish"
   - Contact administrator

2. System access issues:
   - Clear browser cache
   - Try incognito mode
   - Contact administrator

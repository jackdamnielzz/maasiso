# Codebase Summary

## Project Structure
- `/frontend`: Next.js frontend application
  - `/app`: Page components and routing
    - `page.tsx`: Root route component (displays home page)
    - `/home`: Home page route (same content as root)
  - `/src`: Source code
    - `/lib`: Shared libraries and types
    - `/components`: React components
  - Development server runs on http://localhost:3000

## Key Components
- Frontend Development Server
  - Local development at http://localhost:3000
  - Auto-reloading enabled
  - See FRONTEND_ACCESS_GUIDE.md for access details

- Backend API
  - Running at http://153.92.223.23:1337
  - Provides data for frontend components
  - Strapi CMS for content management
  - Comprehensive test content being created

## Content Types and Components
- Page Components
  - Hero sections
  - Text blocks
  - Image galleries
  - Feature grids
  - Buttons
- Content Types
  - Blog posts
  - News articles
  - Pages
  - Categories
  - Tags
- Navigation
  - Menu systems
  - Social links

## Routing Structure
- Root Route ('/')
  - Serves as default landing page
  - Displays content from CMS home page
  - Component: app/page.tsx

- Home Route ('/home')
  - Mirrors root route content
  - Uses same CMS data source
  - Component: app/home/page.tsx

## Data Flow
1. Frontend makes API requests to Strapi backend
2. Backend returns page data with components
3. Frontend validates and normalizes data:
   - Validates blog post structure
   - Handles case-sensitive field names (e.g., 'Content')
   - Normalizes image data from flat to structured format
4. Components render normalized data:
   - BlogCard handles image display
   - Category filtering
   - Pagination

## Development Environment
- Frontend runs locally for development
- Backend runs on remote server
- See manuals/FRONTEND_ACCESS_GUIDE.md for detailed setup
- See manuals/CMS_TESTING_GUIDE.md for content testing procedures

## Testing Infrastructure
- Comprehensive CMS testing plan in place
- Test content being created for all components
- Visual verification procedures established
- Functional testing guidelines documented

## Recent Significant Changes
- [2025-01-24] Working on blog post validation and image handling:
  - Updated Image interface to match API response structure
  - Added validation for case-sensitive content fields
  - Improved error logging and debugging
- [2025-01-24] Created CMS testing guide and test content plan
- [2025-01-24] Added component type handling for both raw and normalized formats
- [2025-01-24] Created frontend access documentation
- [2025-01-24] Updated type system for component handling
- [2025-01-24] Configured root and home routes to serve same content

## Last Updated: 2025-01-24

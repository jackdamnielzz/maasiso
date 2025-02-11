# Product Context

## Why this project exists
This project is a web application built with Next.js that serves as a website with various content types including blog posts, news articles, testimonials, tools, whitepapers, and services. The project aims to provide a modern, responsive, and secure web experience with proper content management capabilities.

## What problems it solves
- Provides a structured way to manage and display various types of content
- Enables responsive web design across different devices
- Handles blog posts and news articles with rich markdown rendering
- Manages media content with proper optimization
- Supports multiple content variations and templates
- Provides category filtering and search functionality
- Implements proper error handling and loading states
- Supports localization (currently includes Dutch locale support)
- Ensures secure content delivery through HTTPS
- Provides seamless access through both www and non-www domains

## How it should work
The application should:
1. Be accessible securely via:
   - https://maasiso.nl (primary domain)
   - https://www.maasiso.nl (subdomain)
   - Automatic HTTP to HTTPS redirection

2. Serve content through:
   - Next.js frontend, properly styled and responsive
   - Nginx reverse proxy with SSL/HTTPS support
   - Proper static asset delivery with caching

3. Handle various content types through:
   - CMS backend integration
   - Structured content management
   - Type-safe content handling

4. Implement proper static asset resolution for:
   - CSS with correct MIME types
   - JavaScript with proper caching
   - Fonts with CORS support
   - SVG icons with correct content types

5. Support proper rendering of all UI elements including:
   - Correctly sized social media icons
   - Proper text formatting
   - Responsive layout behavior
   - Secure asset delivery

6. Provide security features:
   - SSL/HTTPS encryption
   - Security headers
   - CORS policies
   - Content security

7. Implement proper error handling and loading states

8. Support content filtering and search functionality

9. Handle media content with:
   - Proper optimization
   - Lazy loading
   - Secure delivery

10. Support localization for different languages

11. Maintain high performance through:
    - Asset caching
    - Compression
    - Optimized delivery
    - CDN compatibility

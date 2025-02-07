# CMS Data Flow Documentation

This folder contains comprehensive documentation about how data flows from the Content Management System (Strapi) to our frontend application.

## Documentation Files

1. `01_project_structure.md`
   - Complete project structure overview
   - Focus on CMS-related components
   - File organization and relationships

2. `02_integration_details.md`
   - Detailed CMS integration documentation
   - Data handling components
   - Type validation and normalization

3. `03_operations_guide.md`
   - Quick reference for common operations
   - Code examples
   - Troubleshooting tips

## Key Files Referenced

### API Layer
- `frontend/src/lib/api.ts`
- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/api/request-queue.ts`

### Data Processing
- `frontend/src/lib/normalizers.ts`
- `frontend/src/lib/types.ts`

### Page Components
- `frontend/src/app/[slug]/page.tsx`
- `frontend/src/app/blog-posts/[slug]/page.tsx`

## Purpose

This documentation explains how we:
1. Fetch data from the CMS
2. Process and validate the data
3. Transform it for frontend use
4. Display it in our components

## When to Use This Documentation

- When working with CMS data
- When adding new content types
- When debugging data flow issues
- When implementing new features that use CMS data

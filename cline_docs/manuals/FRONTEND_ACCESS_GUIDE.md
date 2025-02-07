# Frontend Development Access Guide

## Default Landing Page

The home page from the CMS (with slug 'home') serves as both the home page and the default landing page of the website. This means:
- Visiting http://localhost:3000 shows the home page content
- Visiting http://localhost:3000/home shows the same content
- The content is managed in the CMS under the 'home' page
- Both routes are configured to fetch and display the same CMS content

## Local Development Server

During development, the frontend can be accessed through the local development server. Here's how to start and access it:

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm run dev
```

3. Access the frontend:
- URL: http://localhost:3000 or http://localhost:3000/home
- The development server will automatically reload when you make changes to the code

## Important Notes

- The development server must be running to access the frontend
- The backend API (Strapi) must also be running at http://153.92.223.23:1337
- Any changes to the code will trigger an automatic reload of the page
- Content changes in the CMS will be reflected on both routes

## Route Configuration

- `/app/page.tsx`: Root route component that displays the home page content
- `/app/home/page.tsx`: Home route component that displays the same content
- Both components fetch data using the 'home' slug from the CMS

## Common Issues and Solutions

1. If the page doesn't load:
   - Check if the development server is running (`npm run dev`)
   - Verify the backend API is accessible
   - Clear browser cache and reload

2. If components don't update:
   - The development server should automatically reload
   - If not, manually refresh the page
   - Check the terminal for any error messages

## Development URLs

- Frontend: http://localhost:3000 or http://localhost:3000/home
- Backend API: http://153.92.223.23:1337
- Backend Admin: http://153.92.223.23:1337/admin

## Last Updated: 2025-01-24
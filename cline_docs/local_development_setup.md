# Local Development Environment Setup

## Overview
To safely make content type changes, we need to set up a local development environment. This will allow us to:
1. Make and test content type changes locally
2. Export the changes
3. Apply them to production safely

## Setup Steps

### 1. Create Local Strapi Project
```bash
# Create backend directory
mkdir backend
cd backend

# Create new Strapi project
npx create-strapi-app@latest ./ --quickstart --typescript

# Install required dependencies
npm install @strapi/plugin-graphql pg
```

### 2. Configure Local Database
```bash
# Install PostgreSQL if not already installed
# Windows: Download from https://www.postgresql.org/download/windows/
# Then create a new database:
createdb maasiso_dev
```

### 3. Configure Environment
Create `.env` file in backend directory:
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-random-keys-here
API_TOKEN_SALT=your-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=maasiso_dev
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_SSL=false
```

### 4. Export Production Schema
```bash
# SSH into production server
ssh root@153.92.223.23

# Export current schema
cd /var/www/strapi
npm run strapi export -- --no-encrypt

# Copy export file to local machine
exit
scp root@153.92.223.23:/var/www/strapi/export_*.tar.gz ./backend/
```

### 5. Import Schema Locally
```bash
# In backend directory
npm run strapi import -- --force ./export_*.tar.gz
```

### 6. Start Development Server
```bash
npm run develop
```

## Making Content Type Changes

1. Access local admin panel at http://localhost:1337/admin
2. Make the required Event content type changes:
   - Add registration enable/disable field
   - Add early bird discount component
   - Add end time field
3. Test changes thoroughly
4. Export the updated schema

## Applying Changes to Production

After testing locally, we'll need to:
1. Export the schema from local development
2. Create a backup of production
3. Import the new schema to production
4. Test the changes in production

## Revision History
- **Date:** 2025-01-12
- **Description:** Initial local development setup instructions
- **Author:** AI

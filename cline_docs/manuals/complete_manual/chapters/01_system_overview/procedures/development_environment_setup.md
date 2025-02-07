# Development Environment Setup

This guide provides step-by-step instructions for setting up a local development environment for the MaasISO CMS.

## Prerequisites

Before beginning this procedure, ensure you have:
* Administrator access to your development machine
* Minimum 8GB RAM
* 20GB free disk space
* Internet connection
* Git installed and configured

> **Important**: These instructions assume you're using Windows 11. For other operating systems, adjust commands accordingly.

## Installation Steps

### 1. Install Node.js
```bash
# Download and install Node.js v20.18.1
# Visit: https://nodejs.org/

# Verify installation
node -v  # Should show v20.18.1
npm -v   # Should show compatible npm version
```

### 2. Install PostgreSQL
```bash
# Download and install PostgreSQL
# Visit: https://www.postgresql.org/download/

# Verify installation
psql --version
```

### 3. Install Project Dependencies
```bash
# Clone project repository
git clone [repository-url]

# Install dependencies
cd project-directory
npm install
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root:
```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_password
```

### 2. Database Setup
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE strapi_db;

-- Create user
CREATE USER strapi WITH ENCRYPTED PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE strapi_db TO strapi;
```

### 3. Strapi Configuration
```typescript
// config/database.ts
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi_db'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'your_password'),
      schema: env('DATABASE_SCHEMA', 'public'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
```

## Verification

### 1. Start Development Server
```bash
npm run develop
```

### 2. Verify Access Points
* Admin panel loads at: http://localhost:1337/admin
* API responds at: http://localhost:1337/api
* Database connection successful
* Content types accessible

### 3. Run Tests
```bash
npm run test
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Node version mismatch | Use nvm to switch to v20.18.1 |
| Database connection fails | Check PostgreSQL service is running |
| Port conflicts | Check if port 1337 is available |
| Missing dependencies | Run `npm install` again |

### Error Messages

1. "EADDRINUSE: address already in use"
   ```bash
   # Find process using port
   netstat -ano | findstr :1337
   
   # Kill process
   taskkill /PID [process_id] /F
   ```

2. "Database connection failed"
   ```bash
   # Check PostgreSQL status
   services.msc
   # Look for "PostgreSQL" service
   ```

## Related Documentation
- [System Overview](../01_system_overview.md)
- [Database Configuration](./database_configuration.md)
- [Production Deployment](./production_deployment.md)

---

Last Updated: 2025-01-19  
Version: 1.0  
Status: Draft

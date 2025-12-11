# Project Architecture Documentation

## System Overview

The Maasiso project is a distributed web application using a two-server architecture, separating the frontend and backend components for optimal performance, security, and maintainability.

### Infrastructure Architecture

1. **Backend Server (VPS1)**
   - Server: srv692111.hstgr.cloud (153.92.223.23)
   - Location: Netherlands
   - Specifications:
     * CPU: 2 cores
     * Memory: 8 GB
     * Storage: 100 GB
     * OS: Ubuntu 22.04
   - Components:
     * Strapi CMS
     * PM2 Process Manager
     * Node.js Runtime

2. **Frontend Server (VPS2)**
   - Server: srv718842.hstgr.cloud (147.93.62.188)
   - Location: Germany
   - Specifications:
     * CPU: 2 cores
     * Memory: 8 GB
     * Storage: 100 GB
     * OS: Ubuntu 22.04
   - Components:
     * Next.js Application
     * Nginx Reverse Proxy
     * PM2 Process Manager
     * Node.js Runtime

## Project Structure

### Frontend Application (`/`)
- **`app/`**: Next.js app router structure containing page components and API routes
- **`src/`**: Core application source code
  * `components/`: Reusable UI components
  * `lib/`: Utility functions and services
  * `hooks/`: Custom React hooks
  * `types/`: TypeScript type definitions
- **`public/`**: Static assets
- **`scripts/`**: Deployment and utility scripts

### Key Components

1. **Presentation Layer**
   - Location: `app/`, `src/components/`
   - Technology: React, Next.js
   - Purpose: User interface and interactions
   - Key Features:
     * Server-side rendering
     * Client-side navigation
     * Dynamic routing
     * Static page generation

2. **API Layer**
   - Location: `app/api/`
   - Technology: Next.js API routes
   - Purpose: Backend communication and data proxying
   - Key Features:
     * Proxy to Strapi backend
     * Request/response handling
     * Error management
     * Rate limiting

3. **Service Layer**
   - Location: `src/lib/`
   - Purpose: Business logic and utilities
   - Key Features:
     * Data fetching
     * State management
     * Authentication
     * Error handling

4. **Configuration Layer**
   - Files: `next.config.js`, `.env.production`
   - Purpose: Application configuration
   - Key Settings:
     * Build settings
     * Environment variables
     * API endpoints
     * Runtime configuration

## Deployment Architecture

### Backend Deployment (VPS1)

1. **Process Management**
   - Tool: PM2
   - Processes:
     * Strapi CMS (Primary)
   - Configuration:
     * Auto-restart enabled
     * Error logging
     * Process monitoring

2. **Network Configuration**
   - Ports:
     * 1337: Strapi API
   - Security:
     * CORS configuration
     * Rate limiting
     * SSL/TLS encryption

### Frontend Deployment (VPS2)

1. **Process Management**
   - Tool: PM2
   - Processes:
     * Next.js application
   - Configuration:
     * Production optimization
     * Error handling
     * Auto-restart

2. **Nginx Configuration**
   - Purpose: Reverse proxy and static file serving
   - Features:
     * SSL termination
     * Caching
     * Compression
     * Security headers

3. **Monitoring**
   - Health checks
   - Performance metrics
   - Error tracking
   - Log management

## Security Architecture

1. **Access Control**
   - SSH key authentication
   - Firewall rules
   - Role-based access
   - API authentication

2. **Data Protection**
   - SSL/TLS encryption
   - Secure headers
   - CORS policies
   - Input validation

3. **Monitoring & Logging**
   - Access logs
   - Error logs
   - Security alerts
   - Performance metrics

## Deployment Workflow

1. **Code Management**
   - Version Control: Git
   - Repository: GitHub
   - Branch Strategy:
     * main: production
     * develop: staging
     * feature branches: development

2. **Deployment Process**
   - Frontend:
     1. Code push to GitHub
     2. Build process
     3. SFTP transfer to VPS2
     4. PM2 restart
   - Backend:
     1. Code push to GitHub
     2. Pull on VPS1
     3. Build process
     4. PM2 restart

3. **Verification**
   - Health checks
   - API testing
   - Frontend verification
   - Log monitoring

## Maintenance Procedures

1. **Backup Strategy**
   - Database backups
   - File system backups
   - Configuration backups
   - Automated scheduling

2. **Monitoring**
   - Server health
   - Application performance
   - Error rates
   - Resource usage

3. **Update Procedures**
   - Security patches
   - Dependency updates
   - Feature deployments
   - Rollback procedures

## Documentation Structure

1. **Technical Documentation**
   - Architecture diagrams
   - API documentation
   - Database schemas
   - Deployment guides

2. **Operational Documentation**
   - Monitoring procedures
   - Backup procedures
   - Emergency responses
   - Contact information

## Next Steps

1. **Infrastructure Improvements**
   - Implement CI/CD pipeline
   - Enhance monitoring
   - Automate deployments
   - Improve backup systems

2. **Security Enhancements**
   - Security audit
   - Access control review
   - Monitoring improvements
   - Incident response planning

3. **Documentation Updates**
   - Complete missing sections
   - Add troubleshooting guides
   - Create runbooks
   - Update contact information

This document should be updated regularly as the architecture evolves and new components are added or modified.
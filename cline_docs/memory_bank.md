# Memory Bank - System Architecture and Deployment

## Current Status (2025-02-11)

### System Architecture
1. Two-VPS Architecture:
   - VPS1 (153.92.223.23):
     * Purpose: Backend/CMS
     * Runs Strapi CMS
     * Handles content management
     * Located in Netherlands
     * Accessible through secure proxy

   - VPS2 (147.93.62.188):
     * Purpose: Frontend/Website
     * Runs Next.js application
     * Serves public website
     * Located in Germany
     * Public-facing with SSL
     * Implements secure API proxy

2. Domain Configuration:
   - Primary: https://maasiso.nl
   - Secondary: https://www.maasiso.nl
   - DNS Records:
     * A record → 147.93.62.188 (VPS2)
     * CNAME www → maasiso.nl
     * TTL: 300 seconds

3. Security Setup:
   - SSL certificates installed
   - HTTPS enforced
   - Security headers configured
   - Automatic HTTP to HTTPS redirection
   - Let's Encrypt auto-renewal
   - API proxy with request validation
   - Token-based authentication

### What We've Done
1. Frontend Deployment (VPS2):
   - Next.js application deployed
   - Nginx reverse proxy configured
   - SSL certificates installed
   - Static assets properly served
   - PM2 process management setup
   - API proxy implementation
   - Blog page functionality fixed

2. Backend Setup (VPS1):
   - Strapi CMS installed
   - Content types configured
   - API endpoints established
   - Database configured
   - Media handling setup
   - Secure API access

3. Integration:
   - Frontend-Backend communication through proxy
   - API endpoints secured and validated
   - Content fetching optimized
   - Media delivery configured
   - Request caching implemented

### Current State
1. Website Access:
   - Fully functional through HTTPS
   - Proper SSL certification
   - Working on both www and non-www
   - All assets loading correctly
   - Blog page working properly

2. Content Management:
   - CMS accessible through secure proxy
   - Content types properly configured
   - Media handling working
   - API endpoints responding
   - Blog content delivery working

3. Performance:
   - Static assets cached
   - Gzip compression enabled
   - Browser caching configured
   - Response times optimized
   - API responses cached

### Next Steps
1. Content Implementation:
   - Complete testimonials frontend
   - Implement tools section
   - Add whitepapers (planned)
   - Develop services section

2. System Improvements:
   - Set up CI/CD pipeline
   - Implement monitoring
   - Configure backups
   - Enhance error tracking
   - Optimize API caching

3. Documentation:
   - Create content guides
   - Document deployment process
   - Update configuration docs
   - Create maintenance guides
   - Document API integration patterns

## Technical Configuration
1. VPS2 (Frontend):
   - IP: 147.93.62.188
   - Domain: maasiso.nl
   - SSL: Let's Encrypt
   - Stack: Next.js, Nginx, PM2
   - API Proxy: Next.js API routes

2. VPS1 (Backend):
   - IP: 153.92.223.23
   - Access through secure proxy
   - Stack: Strapi, Node.js
   - Database: PostgreSQL
   - Token-based authentication

3. Integration:
   - Secure API communication
   - Media delivery
   - Content synchronization
   - Error handling
   - Request validation
   - Response caching

## Documentation References
- Nginx configuration documented in systemPatterns.md
- Deployment process in progress.md
- SSL setup in vps_credentials.md
- Architecture details in productContext.md
- Current state in activeContext.md
- API patterns in techContext.md

## Maintenance Notes
1. SSL Certificates:
   - Auto-renewal configured
   - Check every 60 days
   - Monitor Let's Encrypt logs
   - Verify proxy certificates

2. Backups:
   - Regular database backups needed
   - Configuration backups required
   - Document backup procedures
   - API configuration backups

3. Monitoring:
   - Set up uptime monitoring
   - Configure error tracking
   - Implement performance monitoring
   - Set up alert systems
   - Monitor API health

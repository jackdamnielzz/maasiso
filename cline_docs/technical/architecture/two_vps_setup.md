# Two-VPS Architecture Documentation

## Overview
The MaasISO website infrastructure is split across two VPS instances to separate concerns and enhance security:

1. VPS1 (Backend - Strapi CMS)
   - IP: 153.92.223.23
   - Location: Netherlands
   - Purpose: Content Management System
   - Not publicly accessible

2. VPS2 (Frontend - Next.js)
   - IP: 147.93.62.188
   - Location: Germany
   - Purpose: Public Website
   - SSL secured

## Architecture Details

### Backend (VPS1)
1. Components:
   - Strapi CMS
   - PostgreSQL Database
   - Media Storage
   - API Endpoints

2. Responsibilities:
   - Content Management
   - Media Handling
   - Data Storage
   - API Services

3. Security:
   - Internal Access Only
   - Restricted Ports
   - Database Security
   - API Authentication

### Frontend (VPS2)
1. Components:
   - Next.js Application
   - Nginx Reverse Proxy
   - PM2 Process Manager
   - SSL Certificates

2. Responsibilities:
   - Public Website Serving
   - Static Asset Delivery
   - SSL/HTTPS Handling
   - User Interface

3. Security:
   - SSL Encryption
   - Security Headers
   - CORS Policies
   - HTTP/HTTPS Redirection

## Communication Flow
1. Content Creation:
   - Authors access Strapi CMS on VPS1
   - Content stored in PostgreSQL
   - Media files stored on VPS1

2. Content Delivery:
   - Next.js on VPS2 fetches content via API
   - Media served through optimized endpoints
   - Content cached appropriately

3. User Access:
   - Users access https://maasiso.nl
   - Traffic handled by VPS2
   - Content served from cached API responses

## Security Considerations
1. VPS1 (Backend):
   - Firewall configured for minimal exposure
   - Database accessible only locally
   - API endpoints secured with authentication
   - Regular security updates

2. VPS2 (Frontend):
   - Full SSL encryption
   - Security headers implemented
   - Rate limiting configured
   - DDoS protection enabled

## Maintenance Procedures
1. Backend Updates:
   - Schedule maintenance windows
   - Database backups before updates
   - Test API changes locally
   - Verify CMS functionality

2. Frontend Updates:
   - Build and test locally
   - Deploy during low-traffic periods
   - Verify SSL certificates
   - Check static asset delivery

## Monitoring
1. Backend Monitoring:
   - Database performance
   - API response times
   - Storage capacity
   - Error rates

2. Frontend Monitoring:
   - Website availability
   - SSL certificate status
   - Page load times
   - Error tracking

## Backup Strategy
1. VPS1 Backups:
   - Daily database backups
   - Weekly system backups
   - Media file backups
   - Configuration backups

2. VPS2 Backups:
   - Regular configuration backups
   - SSL certificate backups
   - Static asset backups
   - Log file archives

## Emergency Procedures
1. Backend Issues:
   - Database recovery procedures
   - API fallback options
   - Content recovery steps
   - Contact: niels@maasiso.nl

2. Frontend Issues:
   - SSL certificate renewal
   - Static file recovery
   - Domain configuration
   - Contact: niels@maasiso.nl

## Future Improvements
1. Backend Enhancements:
   - Implement database replication
   - Set up content staging
   - Enhance API caching
   - Improve media optimization

2. Frontend Enhancements:
   - Implement CDN
   - Enhanced caching
   - Performance optimization
   - Advanced monitoring
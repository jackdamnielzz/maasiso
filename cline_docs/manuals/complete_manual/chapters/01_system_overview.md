# System Overview

## Introduction

This chapter provides a comprehensive overview of the MaasISO CMS system architecture, components, and environments. It serves as the foundation for understanding the entire content management system.

### Prerequisites

Before proceeding, ensure you have:
* Basic understanding of content management systems
* Familiarity with web technologies
* Access to system documentation
* Server access credentials (if applicable)

> **Important**: This documentation assumes familiarity with basic web development concepts and technologies.

## System Architecture

### Core Components

| Component | Description | Version |
|-----------|-------------|----------|
| Strapi CMS | Headless CMS backend | v5.7.0 |
| Next.js | Frontend framework | Latest |
| PostgreSQL | Database system | Latest |
| Node.js | Runtime environment | v20.18.1 |

### Architecture Diagram

```
Frontend (Next.js)
      ↕
   Strapi CMS
      ↕
PostgreSQL Database
```

> The system uses a headless architecture, separating content management from content presentation.

## Environment Setup

### Production Environment

1. Server Details
```
Host: 153.92.223.23
Type: Hostinger KVM1 VPS
OS: Ubuntu 22.04 LTS
```

2. Access Methods
- Admin Panel: http://153.92.223.23/admin
- API Endpoint: http://153.92.223.23/api
- SSH Access: `ssh root@153.92.223.23`

### Development Environment

See [Development Environment Setup](./procedures/development_environment_setup.md) for detailed instructions.

## System Components

### Content Management Backend

Strapi CMS Features:
- Admin interface for content management
- Content type builder for schema definition
- Automatic API generation
- Role-based access control
- Media library management
- Plugin system for extensibility

### Frontend Application

Next.js Framework Features:
- Server-side rendering for SEO
- Static site generation capabilities
- Dynamic routing system
- API routes for backend communication
- Image optimization
- Internationalization support

### Database System

PostgreSQL Features:
- Robust relational database
- JSON field support
- Full-text search capabilities
- Complex querying
- Data integrity enforcement
- Backup and restore functionality

## Development vs Production

### Environment Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| Mode | Development | Production |
| Database | Local | Remote |
| Cache | Disabled | Enabled |
| Logging | Verbose | Essential |
| SSL | Optional | Required |

### Environment Variables

```bash
# Development
NODE_ENV=development
DATABASE_HOST=localhost

# Production
NODE_ENV=production
DATABASE_HOST=153.92.223.23
```

> **Important**: Never use development settings in production environment.

## Reference

### Related Documentation
- [Content Type System](../02_content_type_system/index.md)
- [System Administration](../07_system_administration/index.md)
- [Development Guide](../08_development_guide/index.md)

### External Resources
- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Database connection fails | Check credentials and firewall settings |
| Admin panel inaccessible | Verify Strapi service is running |
| API errors | Check environment variables and permissions |

---

Last Updated: 2025-01-19  
Version: 1.0  
Status: Draft

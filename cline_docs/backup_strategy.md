# Backup Strategy

## Overview
This document outlines the backup procedures for the production environment, including database, file system, and configuration backups.

## Database Backup

### PostgreSQL Backup Configuration
- Daily full database dumps
- Hourly incremental backups
- 30-day retention period
- Compressed storage

### Implementation
The backup script is located at `/etc/cron.daily/postgresql-backup` and includes:

- Automatic directory creation and permissions
- Compressed database dumps with timestamps
- MD5 checksum verification
- Size verification (minimum 1KB)
- 30-day retention policy
- Detailed logging to `/var/log/postgresql/backup.log`

Key features of the implementation:
```bash
# Directory structure
/var/backups/postgresql/           # Backup storage
  ├── full_backup_[timestamp].sql.gz   # Compressed backup
  └── full_backup_[timestamp].sql.gz.md5   # MD5 checksum

/var/log/postgresql/
  └── backup.log                   # Backup operation logs
```

The script runs daily and includes:
1. Directory creation with proper permissions (700)
2. Database dump with compression
3. Size verification
4. MD5 checksum generation
5. Logging of all operations
6. Cleanup of backups older than 30 days

### Backup Testing
- Weekly restore tests to staging environment
- Verification of data integrity
- Recovery time testing
- Documentation of restore procedures

## File System Backup

### Strapi Content Backup
- Daily backup of uploaded files
- Synchronization with remote storage
- Version control for configurations

### Implementation
```bash
# Create backup directory
mkdir -p /var/backups/strapi
chmod 700 /var/backups/strapi

# Daily content backup script (to be placed in /etc/cron.daily/strapi-backup)
#!/bin/bash
BACKUP_DIR="/var/backups/strapi"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
STRAPI_DIR="/path/to/strapi"

# Backup uploads directory
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C "$STRAPI_DIR" uploads/

# Backup configurations
tar -czf "$BACKUP_DIR/config_$TIMESTAMP.tar.gz" -C "$STRAPI_DIR" config/

# Remove old backups
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +30 -delete
```

## Configuration Backup

### System Configuration
- Weekly backup of system configurations
- Version control for custom configurations
- Documentation of changes

### Critical Paths
```
/etc/postgresql/
/etc/nginx/
/etc/fail2ban/
/etc/ufw/
.env files
SSL certificates
```

### Implementation
```bash
# Weekly configuration backup script
#!/bin/bash
BACKUP_DIR="/var/backups/system-config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup system configurations
tar -czf "$BACKUP_DIR/system_config_$TIMESTAMP.tar.gz" \
    /etc/postgresql/14/main/postgresql.conf \
    /etc/postgresql/14/main/pg_hba.conf \
    /etc/nginx/nginx.conf \
    /etc/nginx/sites-available/ \
    /etc/fail2ban/jail.local \
    /etc/ufw/user.rules
```

## Recovery Procedures

### Database Recovery
1. Stop application services
2. Drop existing database if needed
3. Create new database
4. Restore from backup
5. Verify data integrity
6. Restart services

### File System Recovery
1. Stop application services
2. Verify backup integrity
3. Restore files to appropriate locations
4. Check file permissions
5. Restart services

### Configuration Recovery
1. Compare current and backup configurations
2. Restore needed configurations
3. Test configurations
4. Restart affected services

## Testing and Verification

### Manual Verification Steps
1. Check backup directory for new files
2. Verify file sizes are appropriate
3. Validate MD5 checksums
4. Review backup.log for any errors
5. Test restore procedure periodically

### Restore Testing
Test restores should be performed in a separate environment:
1. Create test database
2. Decompress backup file
3. Import using psql
4. Verify data integrity

## Documentation and Logging

### Backup Log Format
Each backup operation logs:
- Timestamp of operation
- Backup file path
- File size
- MD5 checksum
- Success/failure status

### Log Location
All backup operations are logged to `/var/log/postgresql/backup.log`

## Revision History
- **Date:** 2025-01-24
- **Description:** Initial backup strategy documentation
- **Author:** AI
- **Date:** 2025-01-14
- **Description:** Updated to reflect current implementation and removed monitoring
- **Author:** AI

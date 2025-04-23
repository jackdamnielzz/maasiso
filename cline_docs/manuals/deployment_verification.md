# Deployment Verification Guide

## Overview

This document outlines the deployment verification process and tools implemented for the Maasiso website deployment system.

## Components Tested

1. **PM2 Process Management**
   - Successfully implemented cluster mode
   - Automatic process recovery
   - Resource monitoring
   - Log management

2. **Health Check System**
   - Endpoint: `/api/health`
   - Metrics captured:
     - System status
     - Memory usage
     - Node.js version
     - Environment
     - Uptime
     - Timestamp

3. **Deployment Scripts**
   - GitHub Actions workflow
   - Automated backup system
   - Rollback procedures
   - Verification tools

## Verification Tools

### 1. PowerShell Verification Script
Location: `scripts/verify-deployment.ps1`

Features:
- Endpoint health checks
- PM2 process verification
- System resource monitoring
- Comprehensive status reporting

Usage:
```powershell
.\scripts\verify-deployment.ps1
```

### 2. Health Check Endpoint
The health check endpoint provides real-time system metrics:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 127.4288162,
  "memory": {
    "total": 33412775936,
    "free": 20138168320,
    "usage": "39.73%"
  },
  "nodeVersion": "v20.17.0",
  "environment": "production",
  "timestamp": "2025-02-15T14:13:28.089Z"
}
```

## Verification Process

1. **Pre-Deployment Checks**
   - Verify PM2 is installed and configured
   - Check system resources
   - Ensure backup system is ready

2. **Deployment Verification**
   - Run verification script
   - Check health endpoint
   - Monitor PM2 processes
   - Verify system resources

3. **Post-Deployment Monitoring**
   - Watch for any process restarts
   - Monitor memory usage
   - Check application logs
   - Verify all endpoints are responding

## Success Criteria

1. **Health Check**
   - Status must be "healthy"
   - Memory usage below 80%
   - All system metrics reported

2. **PM2 Processes**
   - All processes in "online" state
   - No frequent restarts
   - Proper cluster mode operation

3. **Application Response**
   - Main application responding
   - All API endpoints accessible
   - Response times within limits

## Troubleshooting

### Common Issues

1. **Process Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify ecosystem.config.js
   - Check for port conflicts

2. **High Memory Usage**
   - Monitor with `pm2 monit`
   - Check for memory leaks
   - Adjust PM2 memory limits

3. **Failed Health Checks**
   - Check application logs
   - Verify network connectivity
   - Check system resources

### Recovery Steps

1. **Process Recovery**
```bash
pm2 delete all
pm2 start ecosystem.config.js
```

2. **Rollback Procedure**
```bash
# Get latest backup timestamp
$timestamp = Get-Content /root/backups/latest.txt
# Restore from backup
./scripts/rollback.ps1 -timestamp $timestamp
```

## Maintenance

1. **Regular Checks**
   - Run verification script daily
   - Monitor PM2 logs
   - Check system resources
   - Review application metrics

2. **Log Management**
   - Rotate logs regularly
   - Archive old logs
   - Monitor log sizes

3. **Performance Tuning**
   - Adjust PM2 settings as needed
   - Monitor memory usage
   - Optimize cluster settings

## Contact Information

For deployment issues:
- System Administrator: [Contact Info]
- DevOps Team: [Contact Info]
- Emergency Contact: [Contact Info]
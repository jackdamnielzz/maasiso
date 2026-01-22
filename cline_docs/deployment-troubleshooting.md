# Deployment Troubleshooting Analysis

## Current Issues
The main issue identified is that changes to the application are not immediately visible on the live environment until the VPS is restarted. This indicates several potential problems in the deployment setup.

## Root Causes Analysis

### 1. PM2 Process Management Issues

#### Current Configuration
```javascript
{
  instances: 1,
  exec_mode: 'fork',
  wait_ready: true,
  autorestart: true
}
```

#### Problems
- The wait_ready flag is enabled but the application doesn't send the ready signal
- No graceful reload strategy is implemented
- Single instance configuration limits zero-downtime deployments

### 2. Server Implementation Issues

#### Current Implementation
```javascript
const hostname = 'localhost';
// No signal handling
// No graceful shutdown
```

#### Problems
- Hardcoded localhost hostname may cause binding issues
- Missing proper signal handling (SIGTERM/SIGINT)
- No cleanup procedures during shutdown
- No health check implementation for proper process management

### 3. Nginx Configuration Issues

#### Current Configuration
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

#### Problems
- Missing cache control headers
- No explicit handling of static assets
- Potential stale cache issues

## Recommended Solutions

### 1. PM2 Configuration Updates

Update ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'frontend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    wait_ready: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true,
    env: {
      // ... existing env vars ...
    }
  }]
}
```

### 2. Server Implementation Improvements

Update server.js to include:
- Proper signal handling
- PM2 ready signal
- Graceful shutdown
- Dynamic hostname binding

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Allow external connections
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let server;

app.prepare().then(() => {
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Proper error handling
  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    if (process.send) {
      process.send('ready'); // PM2 ready signal
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
});

function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}
```

### 3. Nginx Configuration Improvements

Update nginx configuration:
```nginx
server {
    listen 80;
    server_name 147.93.62.188;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Browser caching for static assets
    location /_next/static {
        alias /var/www/jouw-frontend-website/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }

    location /static {
        alias /var/www/jouw-frontend-website/public;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }

    # Proxy settings for the Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Additional headers for better proxy behavior
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache control
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
```

## Deployment Process Improvements

1. Add a pre-deployment health check
2. Implement zero-downtime deployment strategy
3. Add post-deployment verification
4. Implement automated rollback procedures

## Monitoring Recommendations

1. Add application-level health checks
2. Implement proper logging for deployment events
3. Set up monitoring for process status
4. Add alerts for failed deployments

## Implementation Plan

1. Update server.js with new implementation
2. Update ecosystem.config.js with new PM2 configuration
3. Update Nginx configuration
4. Test deployment process
5. Monitor for improvements

## Success Metrics

After implementing these changes, we should see:
- Immediate visibility of changes after deployment without VPS restart
- Zero downtime during deployments
- Proper process cleanup during restarts
- Better error handling and recovery
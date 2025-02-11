# System Patterns

## How the system is built
The system is built as a Next.js web application deployed to a VPS environment, with the following key components:

1. Frontend Layer:
   - Next.js application serving as the main frontend
   - Static asset handling for CSS, JavaScript, and fonts
   - Component-based architecture for various content types
   - Client-side navigation with proper loading states

2. Backend Layer:
   - CMS system for content management
   - API proxy for secure Strapi communication
   - Static asset storage and serving
   - Server-side request handling

3. Infrastructure Layer:
   - Nginx reverse proxy with SSL/HTTPS support
   - PM2 process manager for Node.js application management
   - VPS hosting environment
   - Let's Encrypt SSL certificates
   - Automatic HTTP to HTTPS redirection

## Key technical decisions
1. Static Asset Resolution:
   - Critical path resolution for CSS files, JavaScript bundles, and font resources
   - Proper MIME type handling through Nginx configuration
   - Cache directives for optimized delivery
   - Cross-origin resource sharing (CORS) configuration for fonts

2. Process Management:
   - PM2 for Node.js application lifecycle management
   - Ecosystem configuration for deployment parameters
   - Process monitoring and auto-restart capabilities
   - State preservation across system reboots

3. Error Handling:
   - Comprehensive error boundaries
   - Detailed validation at multiple levels
   - Proper logging and monitoring
   - Graceful degradation strategies

4. Content Management:
   - Structured content types with validation
   - Rich text handling with markdown support
   - Media optimization and lazy loading
   - Type-safe content handling

5. Security:
   - SSL/HTTPS encryption for all traffic
   - Secure API proxy for CMS communication
   - Security headers configuration
   - Let's Encrypt certificate auto-renewal
   - Request validation and sanitization

## Architecture patterns
1. API Proxy Pattern:
   ```typescript
   // Next.js API route for secure CMS communication
   export async function GET(request: NextRequest) {
     const strapiUrl = process.env.STRAPI_URL;
     const path = params.path.join('/');
     const searchParams = request.nextUrl.searchParams.toString();
     const url = `${strapiUrl}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

     const response = await fetch(url, {
       headers: {
         'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
         'Content-Type': 'application/json',
       },
       next: { revalidate: 60 },
     });

     return NextResponse.json(await response.json());
   }

   // Next.js config for request rewrites
   async rewrites() {
     return {
       beforeFiles: [
         {
           source: '/api/proxy/:path*',
           destination: 'http://153.92.223.23:1337/api/:path*',
         },
       ],
     };
   }
   ```

2. Reverse Proxy Pattern:
   ```nginx
   server {
       listen 80;
       listen 443 ssl;
       server_name maasiso.nl www.maasiso.nl;

       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/maasiso.nl/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/maasiso.nl/privkey.pem;
       
       # Security headers
       add_header X-Content-Type-Options nosniff;
       add_header X-Frame-Options SAMEORIGIN;
       add_header X-XSS-Protection "1; mode=block";

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /_next/static/ {
           alias /var/www/maasiso/app/.next/static/;
           expires 365d;
           access_log off;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       location /static/ {
           alias /var/www/maasiso/app/public/;
           expires 365d;
           access_log off;
           add_header Cache-Control "public, max-age=31536000";
       }
   }
   ```

3. Process Management Pattern:
   - PM2 ecosystem configuration for process management
   - Controlled process termination and restart procedures
   - Process state persistence for system reliability
   - Environment variable management

4. Content Type Pattern:
   - Structured content types with validation
   - Component-based content composition
   - Type-safe content handling
   - Rich text and media integration

5. Error Handling Pattern:
   - Multiple layers of validation
   - Error boundaries for component isolation
   - Detailed error logging and monitoring
   - Graceful degradation strategies

6. Diagnostic Pattern:
   - Browser Developer Tools inspection
     * Network tab for resource loading
     * Console tab for JavaScript exceptions
     * Elements tab for CSS application
   - MIME type verification
   - CSS source map analysis
   - Runtime environment inspection
   - SSL certificate validation

7. Configuration Management Pattern:
   - Environment-specific configuration files
   - Build-time artifact validation
   - Configuration syntax validation
   - Graceful service reloading
   - SSL certificate auto-renewal management

8. Domain Management Pattern:
   - DNS configuration with proper A and CNAME records
   - SSL certificate management through Let's Encrypt
   - Domain-based routing in Nginx
   - www and non-www domain handling

9. Security Pattern:
   - Server-side request validation
   - API proxy for secure CMS communication
   - Token-based authentication
   - Request sanitization
   - Rate limiting and request throttling

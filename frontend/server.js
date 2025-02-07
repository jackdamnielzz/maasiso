const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    // Prepare the Next.js app
    await app.prepare();

    // Create HTTP server
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        
        // Skip metrics API in development
        if (dev && parsedUrl.pathname === '/api/metrics') {
          res.statusCode = 404;
          res.end('Not found in development mode');
          return;
        }

        // Security headers
        res.setHeader('X-DNS-Prefetch-Control', 'on');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
        
        // Handle requests
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });

    // Error handling for the server
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Start listening
    await new Promise((resolve, reject) => {
      server.listen(port, (err) => {
        if (err) reject(err);
        console.log(`> Ready on http://${hostname}:${port}`);
        resolve();
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server
startServer().catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});
import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    // Basic system metrics
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      },
      node: {
        version: process.version,
        env: process.env.NODE_ENV
      }
    };

    // Check database connection if applicable
    // const dbStatus = await checkDatabaseConnection();

    // Check cache if applicable
    // const cacheStatus = await checkCacheConnection();

    // Additional checks can be added here
    // - API dependencies
    // - External services
    // - Storage systems
    // - etc.

    return NextResponse.json(systemInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
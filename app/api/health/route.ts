import { NextResponse } from 'next/server';
import os from 'os';
import { performance } from 'perf_hooks';

interface ExternalAPICheckResult {
  status: boolean;
  responseTime?: number;
  error?: string;
}

// Function to check external API health
async function checkExternalAPI(url: string, timeout = 5000): Promise<ExternalAPICheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const start = performance.now();
    const response = await fetch(url, { 
      signal: controller.signal,
      method: 'HEAD'
    });
    const end = performance.now();
    
    clearTimeout(timeoutId);
    return {
      status: response.ok,
      responseTime: Math.round(end - start)
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

interface DiskSpaceInfo {
  filesystem?: string;
  size?: string;
  used?: string;
  available?: string;
  usedPercentage?: string;
  error?: string;
  details?: string;
}

// Function to check disk space
function checkDiskSpace(): DiskSpaceInfo {
  const path = '/';
  try {
    const { spawnSync } = require('child_process');
    const df = spawnSync('df', ['-h', path]);
    const output = df.stdout.toString();
    const lines = output.split('\n');
    const info = lines[1].split(/\s+/);
    return {
      filesystem: info[0],
      size: info[1],
      used: info[2],
      available: info[3],
      usedPercentage: info[4]
    };
  } catch (error) {
    return {
      error: 'Unable to check disk space',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

interface ProcessMetrics {
  memory: NodeJS.MemoryUsage;
  cpu: {
    user: number;
    system: number;
  };
  resourceUsage: NodeJS.ResourceUsage;
  uptime: number;
}

// Function to get process metrics
function getProcessMetrics(): ProcessMetrics {
  const metrics = {
    memory: process.memoryUsage(),
    cpu: {
      user: process.cpuUsage().user,
      system: process.cpuUsage().system
    },
    resourceUsage: process.resourceUsage(),
    uptime: process.uptime()
  };
  
  return metrics;
}

export async function GET() {
  const startTime = performance.now();
  
  try {
    // Basic system metrics
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      host: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
        },
        cpu: {
          model: os.cpus()[0].model,
          cores: os.cpus().length,
          speed: os.cpus()[0].speed
        }
      },
      process: getProcessMetrics(),
      disk: checkDiskSpace()
    };

    // Check external services
    const [strapiHealth, cmsHealth] = await Promise.all([
      checkExternalAPI(process.env.NEXT_PUBLIC_STRAPI_API_URL as string),
      checkExternalAPI(process.env.NEXT_PUBLIC_API_URL as string)
    ]);

    const externalServices = {
      strapi: strapiHealth,
      cms: cmsHealth
    };

    // Calculate response time
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Compile final health report
    const healthReport = {
      ...systemInfo,
      externalServices,
      performance: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    };

    // Log health check for monitoring
    console.log(`[Health Check] Status: healthy, Response Time: ${responseTime}ms`);

    return NextResponse.json(healthReport, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Response-Time': responseTime.toString()
      }
    });
  } catch (error) {
    console.error('[Health Check Failed]', error);
    
    const errorReport = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        responseTime: `${Math.round(performance.now() - startTime)}ms`
      }
    };

    return NextResponse.json(errorReport, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
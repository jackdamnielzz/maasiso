import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import { performance } from 'perf_hooks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ExternalAPICheckResult {
  status: boolean;
  responseTime?: number;
  error?: string;
}

async function checkExternalAPI(url: string, timeout = 5000): Promise<ExternalAPICheckResult> {
  if (!url) return { status: false, error: 'missing_url' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const start = performance.now();
    const response = await fetch(url, { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timeoutId);

    return {
      status: response.ok,
      responseTime: Math.round(performance.now() - start),
    };
  } catch (error) {
    return {
      status: false,
      error: error instanceof Error ? error.message : 'unknown_error',
    };
  }
}

function isAuthorizedForDetailedHealth(request: NextRequest): boolean {
  const expectedToken = process.env.HEALTH_CHECK_TOKEN?.trim();
  if (!expectedToken) return false;

  const providedToken = request.headers.get('x-health-token')?.trim();
  return !!providedToken && providedToken === expectedToken;
}

function getBasicReport(responseTimeMs: number) {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs,
  };
}

export async function GET(request: NextRequest) {
  const start = performance.now();

  try {
    const responseTimeMs = Math.round(performance.now() - start);
    const basicReport = getBasicReport(responseTimeMs);

    if (!isAuthorizedForDetailedHealth(request)) {
      return NextResponse.json(basicReport, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    const [strapiHealth] = await Promise.all([
      checkExternalAPI(process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''),
    ]);

    const detailedReport = {
      ...basicReport,
      environment: process.env.NODE_ENV || 'unknown',
      host: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
      },
      dependencies: {
        strapi: strapiHealth,
      },
    };

    return NextResponse.json(detailedReport, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

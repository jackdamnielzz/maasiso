import { NextResponse } from 'next/server';
import type { MetricsBatch } from '../../../src/lib/monitoring/types';

const DEBUG = process.env.DEBUG === 'true';

export async function POST(request: Request) {
  try {
    const batch: MetricsBatch = await request.json();

    // TODO: Process metrics (e.g., send to monitoring service)
    
    // Group metrics by type for easier analysis (kept for future use if needed)
    const groupedMetrics = batch.metrics.reduce((acc, metric) => {
      const type = metric.eventType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      message: 'Metrics received',
      batchId: batch.batchId
    });
  } catch (error) {
    if (DEBUG) {
      console.error('[Metrics API Error]', error);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process metrics'
      },
      { status: 500 }
    );
  }
}

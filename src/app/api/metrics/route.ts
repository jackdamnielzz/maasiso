import { NextResponse } from 'next/server';
import type { MetricsBatch } from '@/lib/monitoring/types';

export async function POST(request: Request) {
  try {
    const batch: MetricsBatch = await request.json();

    // TODO: Process metrics (e.g., send to monitoring service)
    // For now, we'll just log them
    console.log('[Metrics API]', {
      batchId: batch.batchId,
      timestamp: batch.timestamp,
      metricCount: batch.metrics.length
    });

    // Group metrics by type for easier analysis
    const groupedMetrics = batch.metrics.reduce((acc, metric) => {
      const type = metric.eventType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('[Metrics Summary]', {
      types: Object.keys(groupedMetrics),
      counts: Object.entries(groupedMetrics).map(([type, metrics]) => ({
        type,
        count: metrics.length
      }))
    });

    return NextResponse.json({ 
      success: true,
      message: 'Metrics received',
      batchId: batch.batchId
    });
  } catch (error) {
    console.error('[Metrics API Error]', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process metrics'
      },
      { status: 500 }
    );
  }
}

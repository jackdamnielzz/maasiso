import { NextRequest, NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export async function GET(request: NextRequest) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  // Log some debugging information
  console.log('Contact test route called');
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_PASSWORD_SET: process.env.EMAIL_PASSWORD ? 'Yes (value hidden)' : 'No'
  });
  
  // Return a simple response with environment info
  return NextResponse.json({
    success: true,
    message: 'Contact test route working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    debug: {
      emailPasswordSet: process.env.EMAIL_PASSWORD ? true : false,
      deploymentTimestamp: new Date().toISOString()
    }
  });
}

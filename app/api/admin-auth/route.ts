import { NextRequest, NextResponse } from 'next/server';

// Simple admin authentication endpoint
// The password is stored in environment variable ADMIN_PASSWORD

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      // Debug info - shows if env var exists but is empty
      const hasEnvVar = 'ADMIN_PASSWORD' in process.env;
      const envVarLength = process.env.ADMIN_PASSWORD?.length ?? 0;
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error',
          debug: {
            hasEnvVar,
            envVarLength,
            envVarIsEmpty: envVarLength === 0,
            trimmedLength: process.env.ADMIN_PASSWORD?.trim()?.length ?? 0
          }
        },
        { status: 500 }
      );
    }
    
    if (password === adminPassword) {
      // Generate a simple session token (in production, use proper JWT or session management)
      const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64');
      
      return NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        token: sessionToken
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Onjuist wachtwoord' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'No token provided' },
      { status: 401 }
    );
  }
  
  try {
    // Decode and verify the token (simple check - in production use proper JWT)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [prefix, timestamp] = decoded.split(':');
    
    if (prefix !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Token expires after 24 hours
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (tokenAge > maxAge) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Token valid' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid token format' },
      { status: 401 }
    );
  }
}

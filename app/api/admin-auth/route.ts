import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, getBearerToken, verifyAdminToken } from '@/lib/admin/auth';

// Simple admin authentication endpoint
// The password is stored in environment variable ADMIN_PASSWORD

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (password === adminPassword) {
      const sessionToken = createAdminToken();
      
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
  const token = getBearerToken(request.headers.get('Authorization'));
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'No token provided' },
      { status: 401 }
    );
  }
  
  const result = verifyAdminToken(token);

  if (result.ok) {
    return NextResponse.json({ success: true, message: 'Token valid' });
  }

  if (result.error === 'misconfigured') {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const status = result.error === 'expired' ? 401 : 403;
  return NextResponse.json(
    { success: false, error: result.error },
    { status }
  );
}

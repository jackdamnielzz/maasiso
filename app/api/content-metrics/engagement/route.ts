import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Here you would typically save the engagement/reading time data
    // For now, we'll just log it and return success
    console.log('Content engagement metrics:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
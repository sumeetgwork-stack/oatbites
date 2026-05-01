import { NextResponse } from 'next/server';
import { logPageView } from '@/lib/db';

export async function POST(req) {
  try {
    const { path, sessionId } = await req.json();
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    await logPageView(path, sessionId || 'anonymous');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log page view:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

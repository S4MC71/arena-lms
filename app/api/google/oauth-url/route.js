import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';
const { getAuthUrl, isGoogleConfigured } = require('@/lib/google');

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  if (!isGoogleConfigured()) {
    return NextResponse.json({
      error: 'Google API not configured',
      setup: true,
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.',
      docsUrl: 'https://console.cloud.google.com/'
    }, { status: 503 });
  }

  const authUrl = getAuthUrl(user.id);
  return NextResponse.json({ success: true, authUrl });
}

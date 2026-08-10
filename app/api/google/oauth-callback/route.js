import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const { createOAuth2Client } = require('@/lib/google');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/teacher?google_error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (userId && db.googleTokens) {
      db.googleTokens[userId] = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope
      };
    }

    return NextResponse.redirect(new URL('/teacher?google_connected=1', request.url));
  } catch (err) {
    return NextResponse.redirect(new URL(`/teacher?google_error=${encodeURIComponent(err.message)}`, request.url));
  }
}

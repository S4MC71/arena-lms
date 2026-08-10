import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/db';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json({ success: true, user: safeUser });
}

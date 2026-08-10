import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { isSharing, frame, broadcasterName } = await request.json();

  db.liveStreamState = {
    isSharing: !!isSharing,
    broadcasterName: broadcasterName || user.name,
    frame: frame || null,
    updatedAt: Date.now()
  };

  return NextResponse.json({ success: true, stream: db.liveStreamState });
}

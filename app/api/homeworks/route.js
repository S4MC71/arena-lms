import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let homeworks = db.homeworks;
  if (user.role === 'student') {
    homeworks = db.homeworks.filter(h => h.batchId === user.batchId);
  }

  return NextResponse.json({ success: true, homeworks });
}

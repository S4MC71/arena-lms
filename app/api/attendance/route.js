import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let logs = db.attendanceLogs;
  if (user.role === 'student') {
    logs = db.attendanceLogs.filter(l => l.studentId === user.id);
  }

  return NextResponse.json({ success: true, logs });
}

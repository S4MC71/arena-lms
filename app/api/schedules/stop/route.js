import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { scheduleId } = await request.json();
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  sched.status = 'COMPLETED';
  db.activeMeetLink = null;
  db.activeMeetScheduleId = null;
  db.liveStreamState.isSharing = false;
  db.liveStreamState.frame = null;

  return NextResponse.json({ success: true, schedule: sched });
}

import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'auditor') {
    return NextResponse.json({ error: 'Auditors only' }, { status: 403 });
  }

  const { batchId, slot, teacherName, topic } = await request.json();
  const newSched = {
    id: `SCH-${Date.now()}`,
    batchId,
    batchName: `Batch ${batchId.replace('B', '')}`,
    day: slot || 'Thursday',
    date: new Date().toISOString().split('T')[0],
    time: '9:30 PM - 11:30 PM',
    teacherName: teacherName || 'Rahat Chowdhury',
    topic: topic || 'New Scheduled Topic',
    status: 'UPCOMING',
    meetLink: null
  };

  db.schedules.unshift(newSched);
  return NextResponse.json({ success: true, schedule: newSched });
}

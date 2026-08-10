import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'auditor') {
    return NextResponse.json({ error: 'Auditors only' }, { status: 403 });
  }

  const { batchId, slot, teacherName, topic } = await request.json();
  const id = `SCH-${Date.now()}`;
  const batchName = `Batch ${batchId.replace('B', '')}`;
  const day = slot || 'Thursday';
  const date = new Date().toISOString().split('T')[0];

  const newSched = {
    id,
    batch_id: batchId,
    batch_name: batchName,
    day,
    date,
    time: '9:30 PM - 11:30 PM',
    teacher_name: teacherName || 'Rahat Chowdhury',
    topic: topic || 'New Scheduled Topic',
    status: 'UPCOMING'
  };

  try {
    await supabase.from('schedules').insert([newSched]);
  } catch (e) {}

  const memSched = {
    id,
    batchId,
    batchName,
    day,
    date,
    time: '9:30 PM - 11:30 PM',
    teacherName: teacherName || 'Rahat Chowdhury',
    topic: topic || 'New Scheduled Topic',
    status: 'UPCOMING',
    meetLink: null
  };
  db.schedules.unshift(memSched);

  return NextResponse.json({ success: true, schedule: memSched });
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db, verifyToken } from '@/lib/db';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = supabase.from('schedules').select('*').order('created_at', { ascending: false });
    if (user.role === 'student') {
      query = query.eq('batch_id', user.batchId);
    }
    const { data, error } = await query;
    if (error || !data) throw error;

    const formatted = data.map(s => ({
      id: s.id,
      batchId: s.batch_id,
      batchName: s.batch_name,
      day: s.day,
      date: s.date,
      time: s.time,
      teacherName: s.teacher_name,
      topic: s.topic,
      status: s.status,
      meetLink: s.meet_link
    }));

    return NextResponse.json({ success: true, schedules: formatted });
  } catch (err) {
    let schedules = db.schedules;
    if (user.role === 'student') schedules = db.schedules.filter(s => s.batchId === user.batchId);
    return NextResponse.json({ success: true, schedules });
  }
}

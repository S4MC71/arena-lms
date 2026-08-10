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
    let query = supabase.from('attendance_logs').select('*').order('created_at', { ascending: false });
    if (user.role === 'student') {
      query = query.eq('student_id', user.id);
    }
    const { data, error } = await query;
    if (error || !data) throw error;

    const formatted = data.map(l => ({
      date: l.date,
      batchId: l.batch_id,
      batchName: l.batch_name,
      studentName: l.student_name,
      studentId: l.student_id,
      status: l.status,
      duration: l.duration,
      joinedAt: l.joined_at
    }));

    return NextResponse.json({ success: true, logs: formatted });
  } catch (err) {
    let logs = db.attendanceLogs;
    if (user.role === 'student') logs = db.attendanceLogs.filter(l => l.studentId === user.id);
    return NextResponse.json({ success: true, logs });
  }
}

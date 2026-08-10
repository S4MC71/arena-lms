import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'auditor') {
    return NextResponse.json({ error: 'Auditors only' }, { status: 403 });
  }

  const { scheduleId } = await request.json();
  if (!scheduleId) {
    return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
    if (error) console.error('Supabase delete schedule error:', error);
  } catch (e) {
    console.error('Supabase delete exception:', e);
  }

  db.schedules = db.schedules.filter(s => s.id !== scheduleId);
  return NextResponse.json({ success: true, message: 'Schedule deleted successfully' });
}

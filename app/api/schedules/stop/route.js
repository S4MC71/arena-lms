import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { scheduleId } = await request.json();

  // 1. Delete all associated chat comments for this class session from Supabase
  try {
    await supabase.from('chat_messages').delete().eq('schedule_id', scheduleId);
  } catch (e) {}

  // 2. Update schedule status in Supabase
  try {
    await supabase.from('schedules').update({
      status: 'UPCOMING',
      meet_link: null
    }).eq('id', scheduleId);
  } catch (e) {}

  // 3. Reset live stream state in Supabase
  try {
    await supabase.from('live_stream').upsert([{
      id: 1,
      is_sharing: false,
      broadcaster_name: user.name,
      frame: null,
      updated_at: new Date().toISOString()
    }]);
  } catch (e) {}

  // 4. Update memory database fallback
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (sched) {
    sched.status = 'UPCOMING';
    sched.meetLink = null;
  }
  db.activeMeetLink = null;
  db.activeMeetScheduleId = null;
  db.liveStreamState.isSharing = false;
  db.liveStreamState.frame = null;
  db.chatMessages = db.chatMessages.filter(m => m.scheduleId !== scheduleId);

  return NextResponse.json({
    success: true,
    message: 'Class session ended and comments cleared successfully.',
    schedule: sched || { id: scheduleId, status: 'UPCOMING' }
  });
}

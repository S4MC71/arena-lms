import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getAuthClientForUser } from '@/lib/google';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { scheduleId, meetLink: providedMeetLink } = await request.json();
  let meetLink = providedMeetLink;

  if (!meetLink) {
    const authClient = getAuthClientForUser(user.id);
    if (authClient) {
      try {
        const { SpacesServiceClient } = require('@google-apps/meet');
        const meetClient = new SpacesServiceClient({ authClient });
        const [response] = await meetClient.createSpace({ space: { config: { accessType: 'OPEN' } } });
        meetLink = response.meetingUri;
      } catch (err) {
        console.error('Meet creation error:', err);
      }
    }
  }

  try {
    await supabase.from('schedules').update({
      status: 'LIVE',
      meet_link: meetLink || null
    }).eq('id', scheduleId);
  } catch (e) {}

  const sched = db.schedules.find(s => s.id === scheduleId);
  if (sched) {
    sched.status = 'LIVE';
    if (meetLink) sched.meetLink = meetLink;
  }
  db.activeMeetLink = meetLink || (sched ? sched.meetLink : null);
  db.activeMeetScheduleId = scheduleId;

  return NextResponse.json({ success: true, schedule: sched || { id: scheduleId, status: 'LIVE', meetLink }, meetLink });
}

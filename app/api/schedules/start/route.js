import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { getAuthClientForUser } from '@/lib/google';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { scheduleId, meetLink: providedMeetLink } = await request.json();
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  sched.status = 'LIVE';
  let meetLink = providedMeetLink;

  if (!meetLink) {
    const authClient = getAuthClientForUser(user.id);
    if (authClient) {
      try {
        const { SpacesServiceClient } = require('@google-apps/meet');
        const meetClient = new SpacesServiceClient({ authClient });
        const [response] = await meetClient.createSpace({
          space: { config: { accessType: 'OPEN' } }
        });
        meetLink = response.meetingUri;
      } catch (err) {
        console.error('Meet creation error:', err);
      }
    }
  }

  if (meetLink) sched.meetLink = meetLink;
  db.activeMeetLink = sched.meetLink;
  db.activeMeetScheduleId = sched.id;

  return NextResponse.json({ success: true, schedule: sched, meetLink: sched.meetLink });
}

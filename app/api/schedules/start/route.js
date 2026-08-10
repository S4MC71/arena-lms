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

  // 1. Try Google Meet API / Calendar API if teacher connected Google OAuth
  if (!meetLink) {
    let authClient = getAuthClientForUser(user.id);
    
    // If not found in memory, try loading tokens from Supabase
    if (!authClient) {
      try {
        const { data } = await supabase.from('google_tokens').select('*').eq('user_id', user.id).single();
        if (data && data.tokens) {
          db.googleTokens[user.id] = data.tokens;
          authClient = getAuthClientForUser(user.id);
        }
      } catch (e) {}
    }

    if (authClient) {
      try {
        const { google } = require('googleapis');
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        
        const event = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: {
            summary: `Arena Security Live Class — ${user.name}`,
            description: 'Arena Web Security LMS Live Classroom Session via Google Meet',
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
            conferenceData: {
              createRequest: {
                requestId: `arena-meet-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          }
        });

        meetLink = event.data.hangoutLink || (event.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri);
      } catch (err) {
        console.error('Google Calendar Meet generation error:', err);
      }
    }
  }

  // 2. Default Instant Google Meet Link fallback
  if (!meetLink) {
    meetLink = 'https://meet.google.com/new';
  }

  // 3. Update Supabase Database
  try {
    await supabase.from('schedules').update({
      status: 'LIVE',
      meet_link: meetLink
    }).eq('id', scheduleId);
  } catch (e) {}

  const sched = db.schedules.find(s => s.id === scheduleId);
  if (sched) {
    sched.status = 'LIVE';
    sched.meetLink = meetLink;
  }
  db.activeMeetLink = meetLink;
  db.activeMeetScheduleId = scheduleId;

  return NextResponse.json({
    success: true,
    schedule: sched || { id: scheduleId, status: 'LIVE', meetLink },
    meetLink
  });
}

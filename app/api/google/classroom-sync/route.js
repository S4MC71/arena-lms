import { NextResponse } from 'next/server';
import { verifyToken, db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getAuthClientForUser } from '@/lib/google';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Teachers only' }, { status: 403 });
  }

  const { title, text, type } = await request.json();

  let authClient = getAuthClientForUser(user.id);
  if (!authClient) {
    try {
      const { data } = await supabase.from('google_tokens').select('*').eq('user_id', user.id).single();
      if (data && data.tokens) {
        db.googleTokens[user.id] = data.tokens;
        authClient = getAuthClientForUser(user.id);
      }
    } catch (e) {}
  }

  if (!authClient) {
    return NextResponse.json({
      error: 'Google Workspace not connected',
      message: 'Please connect your Google Account in Teacher Portal first.'
    }, { status: 400 });
  }

  try {
    const { google } = require('googleapis');
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    // Fetch teacher's active courses
    const coursesRes = await classroom.courses.list({ teacherId: 'me' });
    const courses = coursesRes.data.courses || [];

    if (courses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Google Workspace connected! No active Google Classroom courses found yet.',
        coursesCount: 0
      });
    }

    const courseId = courses[0].id;
    if (type === 'announcement') {
      await classroom.courses.announcements.create({
        courseId,
        requestBody: { text: text || title, state: 'PUBLISHED' }
      });
    } else {
      await classroom.courses.courseWork.create({
        courseId,
        requestBody: {
          title: title || 'Arena Security Classwork Assignment',
          description: text || 'Please review today’s module materials.',
          workType: 'ASSIGNMENT',
          state: 'PUBLISHED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Synced to Google Classroom successfully!',
      courseName: courses[0].name
    });
  } catch (err) {
    return NextResponse.json({ error: 'Google Classroom Sync Error: ' + err.message }, { status: 500 });
  }
}

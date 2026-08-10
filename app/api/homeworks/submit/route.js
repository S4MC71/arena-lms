import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Students only' }, { status: 403 });
  }

  const { homeworkId, submissionContent } = await request.json();
  const subId = `SUB-${Date.now()}`;

  try {
    await supabase.from('submissions').upsert([{
      id: subId,
      homework_id: homeworkId,
      student_id: user.id,
      student_name: user.name,
      status: 'Submitted',
      score: 'Pending',
      content: submissionContent
    }]);
  } catch (e) {}

  const hw = db.homeworks.find(h => h.id === homeworkId);
  if (hw) {
    const existingSub = hw.submissions.find(s => s.studentId === user.id);
    if (existingSub) {
      existingSub.content = submissionContent;
    } else {
      hw.submissions.push({
        studentId: user.id,
        studentName: user.name,
        status: 'Submitted',
        score: 'Pending',
        content: submissionContent
      });
    }
  }

  return NextResponse.json({ success: true, message: 'Homework submitted successfully!' });
}

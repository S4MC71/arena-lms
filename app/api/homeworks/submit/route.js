import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Students only' }, { status: 403 });
  }

  const { homeworkId, submissionContent } = await request.json();
  const hw = db.homeworks.find(h => h.id === homeworkId);
  if (!hw) {
    return NextResponse.json({ error: 'Homework assignment not found' }, { status: 404 });
  }

  const existingSub = hw.submissions.find(s => s.studentId === user.id);
  if (existingSub) {
    existingSub.content = submissionContent;
    existingSub.submittedAt = new Date().toISOString();
  } else {
    hw.submissions.push({
      studentId: user.id,
      studentName: user.name,
      status: 'Submitted',
      score: 'Pending',
      content: submissionContent,
      submittedAt: new Date().toISOString()
    });
  }

  return NextResponse.json({ success: true, message: 'Homework submitted successfully!' });
}

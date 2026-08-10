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
    let hwQuery = supabase.from('homeworks').select('*').order('created_at', { ascending: false });
    if (user.role === 'student') {
      hwQuery = hwQuery.eq('batch_id', user.batchId);
    }
    const { data: hwData, error: hwErr } = await hwQuery;
    if (hwErr || !hwData) throw hwErr;

    const { data: subData } = await supabase.from('submissions').select('*');

    const formatted = hwData.map(h => ({
      id: h.id,
      batchId: h.batch_id,
      title: h.title,
      dueDate: h.due_date,
      description: h.description,
      submissions: (subData || [])
        .filter(s => s.homework_id === h.id)
        .map(s => ({
          studentId: s.student_id,
          studentName: s.student_name,
          status: s.status,
          score: s.score,
          content: s.content,
          submittedAt: s.submitted_at
        }))
    }));

    return NextResponse.json({ success: true, homeworks: formatted });
  } catch (err) {
    let homeworks = db.homeworks;
    if (user.role === 'student') homeworks = db.homeworks.filter(h => h.batchId === user.batchId);
    return NextResponse.json({ success: true, homeworks });
  }
}

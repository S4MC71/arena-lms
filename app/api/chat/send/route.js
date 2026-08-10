import { NextResponse } from 'next/server';
import { verifyToken, db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  const { text, authorName, scheduleId } = await request.json();
  if (!text) {
    return NextResponse.json({ error: 'Message text required' }, { status: 400 });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const classId = scheduleId || 'SCH-101';

  const msg = {
    id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    schedule_id: classId,
    scheduleId: classId,
    author: user ? `${user.name} (${user.role.toUpperCase()})` : (authorName || 'Anonymous Student'),
    role: user ? user.role : 'student',
    text,
    time: timeStr
  };

  try {
    const { error } = await supabase.from('chat_messages').insert([{
      id: msg.id,
      schedule_id: classId,
      author: msg.author,
      role: msg.role,
      text: msg.text,
      time: msg.time
    }]);
    if (error) console.error('Supabase chat insert error:', error);
  } catch (e) {
    console.error('Supabase chat exception:', e);
  }

  db.chatMessages.push(msg);

  return NextResponse.json({ success: true, message: msg });
}

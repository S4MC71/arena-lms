import { NextResponse } from 'next/server';
import { verifyToken, db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  const { text, authorName } = await request.json();
  if (!text) {
    return NextResponse.json({ error: 'Message text required' }, { status: 400 });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg = {
    id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    author: user ? `${user.name} (${user.role.toUpperCase()})` : (authorName || 'Anonymous Student'),
    role: user ? user.role : 'student',
    text,
    time: timeStr
  };

  try {
    await supabase.from('chat_messages').insert([msg]);
  } catch (e) {
    console.error('Supabase insert error:', e);
  }

  db.chatMessages.push(msg);

  return NextResponse.json({ success: true, message: msg });
}

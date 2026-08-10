import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

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
    id: `MSG-${Date.now()}`,
    author: user ? `${user.name} (${user.role.toUpperCase()})` : (authorName || 'Anonymous Student'),
    role: user ? user.role : 'student',
    text,
    time: timeStr
  };

  db.chatMessages.push(msg);
  return NextResponse.json({ success: true, message: msg });
}

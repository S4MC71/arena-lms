import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const scheduleId = body.scheduleId || body.id;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // 1. Delete associated chat comments for this class from Supabase
    try {
      await supabase.from('chat_messages').delete().eq('schedule_id', scheduleId);
    } catch (e) {}

    // 2. Delete schedule from Supabase Database
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('Supabase schedule delete error:', error);
    }

    // 3. Delete from memory fallback
    db.schedules = db.schedules.filter(s => s.id !== scheduleId);
    db.chatMessages = db.chatMessages.filter(m => m.scheduleId !== scheduleId);

    return NextResponse.json({ success: true, message: 'Schedule and class comments deleted successfully', scheduleId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  return POST(request);
}

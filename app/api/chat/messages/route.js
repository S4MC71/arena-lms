import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get('scheduleId') || 'SCH-101';

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      const mem = db.chatMessages.filter(m => (m.scheduleId || 'SCH-101') === scheduleId);
      return NextResponse.json({ success: true, messages: mem });
    }

    return NextResponse.json({ success: true, messages: data });
  } catch (err) {
    const mem = db.chatMessages.filter(m => (m.scheduleId || 'SCH-101') === scheduleId);
    return NextResponse.json({ success: true, messages: mem });
  }
}

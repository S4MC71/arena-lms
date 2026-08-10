import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return NextResponse.json({ success: true, messages: db.chatMessages });
    }

    return NextResponse.json({ success: true, messages: data });
  } catch (err) {
    return NextResponse.json({ success: true, messages: db.chatMessages });
  }
}

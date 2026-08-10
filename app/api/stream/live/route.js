import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET() {
  let streamState = db.liveStreamState;

  try {
    const { data } = await supabase.from('live_stream').select('*').eq('id', 1).single();
    if (data) {
      streamState = {
        isSharing: data.is_sharing,
        broadcasterName: data.broadcaster_name,
        frame: data.frame,
        updatedAt: data.updated_at
      };
    }
  } catch (e) {}

  return NextResponse.json({
    success: true,
    stream: streamState,
    activeMeetLink: db.activeMeetLink,
    activeMeetScheduleId: db.activeMeetScheduleId
  });
}

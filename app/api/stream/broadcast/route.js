import { NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const user = verifyToken(authHeader);

  if (!user || (user.role !== 'teacher' && user.role !== 'auditor')) {
    return NextResponse.json({ error: 'Instructors only' }, { status: 403 });
  }

  const { isSharing, frame, broadcasterName } = await request.json();

  const stateObj = {
    isSharing: !!isSharing,
    broadcasterName: broadcasterName || user.name,
    frame: frame || null,
    updatedAt: Date.now()
  };

  db.liveStreamState = stateObj;

  // Persist live stream state in Supabase Database for cross-client sync
  try {
    await supabase.from('live_stream').upsert([{
      id: 1,
      is_sharing: !!isSharing,
      broadcaster_name: broadcasterName || user.name,
      frame: frame || null,
      updated_at: new Date().toISOString()
    }]);
  } catch (e) {}

  return NextResponse.json({ success: true, stream: stateObj });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    success: true,
    stream: db.liveStreamState,
    activeMeetLink: db.activeMeetLink,
    activeMeetScheduleId: db.activeMeetScheduleId
  });
}

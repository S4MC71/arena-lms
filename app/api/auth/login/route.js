import { NextResponse } from 'next/server';
import { db, createToken } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = createToken(user);
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, token, user: safeUser });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

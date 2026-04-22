import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/demo-store';
import { AUTH_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');
    if (!email || password.length < 8) {
      return NextResponse.json({ error: 'Email and password (min 8 chars) required' }, { status: 400 });
    }

    const user = await createUser(email, password);
    const response = NextResponse.json({ ok: true, userId: user.id });
    response.cookies.set(AUTH_COOKIE, user.id, { httpOnly: true, sameSite: 'lax', path: '/' });
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

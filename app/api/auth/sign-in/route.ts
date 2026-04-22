import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/demo-store';
import { AUTH_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, user.id, { httpOnly: true, sameSite: 'lax', path: '/' });
  return response;
}

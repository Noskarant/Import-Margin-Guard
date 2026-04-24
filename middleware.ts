import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'img_user_id';

function redirectTo(path: string, request: NextRequest, params?: Record<string, string>) {
  const url = new URL(path, request.url);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get(AUTH_COOKIE)?.value;
  if (!userId) return redirectTo('/sign-in', request);

  try {
    const orgResponse = await fetch(new URL('/api/org', request.url), {
      headers: { cookie: request.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });

    if (orgResponse.status === 401) return redirectTo('/sign-in', request);
    if (!orgResponse.ok) return redirectTo('/pricing', request, { billing: 'required' });

    const payload = await orgResponse.json();
    const organization = payload.organization;

    if (!organization) return redirectTo('/onboarding', request);
    if (!organization.billingActive) return redirectTo('/pricing', request, { billing: 'required' });

    return NextResponse.next();
  } catch {
    return redirectTo('/pricing', request, { billing: 'required' });
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/imports/:path*', '/analyses/:path*'],
};

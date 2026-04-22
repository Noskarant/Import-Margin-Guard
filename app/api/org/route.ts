import { NextRequest, NextResponse } from 'next/server';
import { createOrganization, findOrgForUser } from '@/lib/demo-store';
import { requireUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    return NextResponse.json({ organization: org ?? null });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const country = String(body.country ?? 'FR').toUpperCase();
    const currency = String(body.currency ?? 'EUR').toUpperCase();
    if (!name) return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    const existing = await findOrgForUser(userId);
    if (existing) return NextResponse.json({ error: 'Organization already exists for this user' }, { status: 400 });

    const org = await createOrganization({ name, country, currency, ownerUserId: userId });
    return NextResponse.json({ organization: org });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

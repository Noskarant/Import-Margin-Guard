import { NextRequest, NextResponse } from 'next/server';
import { createOrganization, findOrgForUser } from '@/lib/data-store';
import { countAnalysesCreatedThisMonth, getOrganizationBilling, STARTER_MONTHLY_ANALYSIS_LIMIT } from '@/lib/billing';
import { requireUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ organization: null });

    const billing = await getOrganizationBilling(org.id);
    const monthlyAnalysesUsed = await countAnalysesCreatedThisMonth(org.id);

    return NextResponse.json({
      organization: {
        ...org,
        billingPlan: billing.billingPlan,
        billingStatus: billing.billingStatus,
        billingActive: billing.isActive,
        pilotExpiresAt: billing.pilotExpiresAt,
        monthlyAnalysesUsed,
        monthlyAnalysesLimit: billing.billingPlan === 'starter' ? STARTER_MONTHLY_ANALYSIS_LIMIT : null,
      },
    });
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

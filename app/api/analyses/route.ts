import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis, findOrgForUser, listAnalyses } from '@/lib/data-store';
import { enforceStarterAnalysisLimit, requireActiveBilling } from '@/lib/billing';
import { requireUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ analyses: [] });
    await requireActiveBilling(org.id);
    const analyses = await listAnalyses(org.id);
    return NextResponse.json({ analyses });
  } catch (error) {
    if ((error as Error).message === 'BILLING_REQUIRED' || (error as Error).name === 'BILLING_REQUIRED') {
      return NextResponse.json({ error: 'Billing required' }, { status: 402 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });
    await requireActiveBilling(org.id);
    await enforceStarterAnalysisLimit(org.id);

    const body = await request.json();
    const importId = String(body.importId ?? '');
    const title = String(body.title ?? '').trim() || 'Untitled analysis';
    if (!importId) return NextResponse.json({ error: 'importId is required' }, { status: 400 });

    const analysis = await createAnalysis({ orgId: org.id, importId, title, createdBy: userId });
    return NextResponse.json({ analysis });
  } catch (error) {
    if ((error as Error).message === 'BILLING_REQUIRED' || (error as Error).name === 'BILLING_REQUIRED') {
      return NextResponse.json({ error: 'Billing required' }, { status: 402 });
    }
    if ((error as Error).message === 'STARTER_ANALYSIS_LIMIT_REACHED' || (error as Error).name === 'STARTER_ANALYSIS_LIMIT_REACHED') {
      return NextResponse.json({ error: 'Starter plan limit reached: 5 analyses per month' }, { status: 403 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

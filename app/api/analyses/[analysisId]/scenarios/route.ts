import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { findOrgForUser, getAnalysis, saveAnalysis } from '@/lib/demo-store';
import { requireUserId } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ analysisId: string }> }) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const { analysisId } = await params;
    const existing = await getAnalysis(analysisId);
    if (!existing || existing.orgId !== org.id) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    const body = await request.json();
    const name = String(body.name ?? '').trim() || 'Scenario';

    const analysis = await saveAnalysis(analysisId, (record) => {
      record.scenarios.push({
        id: randomUUID(),
        name,
        isBaseline: false,
        notes: 'Describe the operational difference for this option',
        purchasePriceMultiplier: 1,
        transportMultiplier: 1,
        ancillaryMultiplier: 1,
      });
    });

    return NextResponse.json({ scenarios: analysis.scenarios });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ analysisId: string }> }) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const { analysisId } = await params;
    const existing = await getAnalysis(analysisId);
    if (!existing || existing.orgId !== org.id) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    const body = await request.json();
    const scenarioId = String(body.scenarioId ?? body.id ?? '');

    const analysis = await saveAnalysis(analysisId, (record) => {
      const scenario = record.scenarios.find((item) => item.id === scenarioId);
      if (!scenario) throw new Error('Scenario not found');
      scenario.name = String(body.name ?? scenario.name);
      scenario.notes = String(body.notes ?? scenario.notes ?? '').trim();
      scenario.purchasePriceMultiplier = Number(body.purchasePriceMultiplier ?? scenario.purchasePriceMultiplier);
      scenario.transportMultiplier = Number(body.transportMultiplier ?? scenario.transportMultiplier);
      scenario.ancillaryMultiplier = Number(body.ancillaryMultiplier ?? scenario.ancillaryMultiplier);
      scenario.dutyRateOverride = body.dutyRateOverride === '' || body.dutyRateOverride == null ? undefined : Number(body.dutyRateOverride);
    });

    return NextResponse.json({ scenarios: analysis.scenarios });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

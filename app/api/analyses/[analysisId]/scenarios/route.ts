import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { findOrgForUser, getAnalysis, saveAnalysis } from '@/lib/data-store';
import { requireUserId } from '@/lib/auth';

function normalizeFxRates(value: unknown) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([currency, rate]) => [String(currency).trim().toUpperCase(), Number(rate)])
      .filter(([currency, rate]) => currency && Number.isFinite(rate) && rate > 0),
  );
}

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
        reportingCurrency: 'EUR',
        exchangeRate: 1,
        fxRates: {},
        costAllocationMethod: 'manual',
        incotermOverride: undefined,
        originCost: 0,
        mainFreightCost: 0,
        insuranceCost: 0,
        destinationCost: 0,
        marginCoverageThreshold: 0.8,
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
      scenario.reportingCurrency = String(body.reportingCurrency ?? scenario.reportingCurrency ?? 'EUR').toUpperCase();
      scenario.exchangeRate = Number(body.exchangeRate ?? scenario.exchangeRate ?? 1);
      scenario.fxRates = normalizeFxRates(body.fxRates ?? scenario.fxRates);
      scenario.costAllocationMethod = body.costAllocationMethod ?? scenario.costAllocationMethod ?? 'manual';
      scenario.incotermOverride = body.incotermOverride ? String(body.incotermOverride).toUpperCase() : undefined;
      scenario.originCost = Number(body.originCost ?? scenario.originCost ?? 0);
      scenario.mainFreightCost = Number(body.mainFreightCost ?? scenario.mainFreightCost ?? 0);
      scenario.insuranceCost = Number(body.insuranceCost ?? scenario.insuranceCost ?? 0);
      scenario.destinationCost = Number(body.destinationCost ?? scenario.destinationCost ?? 0);
      scenario.marginCoverageThreshold = Number(body.marginCoverageThreshold ?? scenario.marginCoverageThreshold ?? 0.8);
    });

    return NextResponse.json({ scenarios: analysis.scenarios });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

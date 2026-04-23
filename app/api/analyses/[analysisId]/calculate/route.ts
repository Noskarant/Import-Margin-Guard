import { NextResponse } from 'next/server';
import { calculateScenario } from '@/features/scenarios/lib/calculate';
import { findOrgForUser, getAnalysis, getImport } from '@/lib/demo-store';
import { requireUserId } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ analysisId: string }> }) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const { analysisId } = await params;
    const analysis = await getAnalysis(analysisId);
    if (!analysis || analysis.orgId !== org.id) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    const importRecord = await getImport(analysis.importId);
    if (!importRecord || importRecord.orgId !== org.id || importRecord.mappedRows.length === 0) {
      return NextResponse.json({ error: 'Mapped import rows not found' }, { status: 400 });
    }

    const results = analysis.scenarios.map((scenario) => {
      const rows = importRecord.mappedRows.map((row) => ({
        unitPurchasePrice: row.unitPurchasePrice * scenario.purchasePriceMultiplier,
        quantity: row.quantity,
        transportCost: row.transportCost * scenario.transportMultiplier,
        dutyRate: scenario.dutyRateOverride ?? row.dutyRate,
        ancillaryFees: row.ancillaryFees * scenario.ancillaryMultiplier,
        salesPrice: row.salesPrice,
      }));

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        isBaseline: scenario.isBaseline,
        notes: scenario.notes ?? '',
        summary: calculateScenario(rows),
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

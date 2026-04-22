import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { calculateScenario } from '@/features/scenarios/lib/calculate';
import { getAnalysis, getImport, getOrganization } from '@/lib/demo-store';

function formatCurrency(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const analysisId = String(body.analysisId ?? '');
    if (!analysisId) return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });

    const analysis = await getAnalysis(analysisId);
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    const importRecord = await getImport(analysis.importId);
    if (!importRecord) return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    const org = await getOrganization(analysis.orgId);

    const locale = org?.country === 'FR' ? 'fr-FR' : 'en-US';
    const currency = org?.currency ?? 'EUR';

    const results = analysis.scenarios.map((scenario) => {
      const rows = importRecord.mappedRows.map((row) => ({
        unitPurchasePrice: row.unitPurchasePrice * scenario.purchasePriceMultiplier,
        quantity: row.quantity,
        transportCost: row.transportCost * scenario.transportMultiplier,
        dutyRate: scenario.dutyRateOverride ?? row.dutyRate,
        ancillaryFees: row.ancillaryFees * scenario.ancillaryMultiplier,
        salesPrice: row.salesPrice,
      }));
      return { scenarioId: scenario.id, scenarioName: scenario.name, isBaseline: scenario.isBaseline, summary: calculateScenario(rows) };
    });

    const sorted = [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted);
    const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
    const best = sorted[0];
    if (!baseline || !best) return NextResponse.json({ error: 'At least one scenario is required' }, { status: 400 });

    const savings = baseline.summary.landedTotal - best.summary.landedTotal;
    const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 800;
    const left = 50;

    page.drawText('Import Margin Guard - Comparison Summary', { x: left, y, font: bold, size: 16, color: rgb(0.06, 0.09, 0.16) });
    y -= 28;
    page.drawText(`Analysis: ${analysis.title}`, { x: left, y, font: regular, size: 11 });
    y -= 16;
    page.drawText(`Organization: ${org?.name ?? 'N/A'}`, { x: left, y, font: regular, size: 11 });
    y -= 16;
    page.drawText(`Export date: ${new Date().toLocaleDateString(locale)}`, { x: left, y, font: regular, size: 11 });

    y -= 26;
    page.drawText(`Baseline scenario: ${baseline.scenarioName}`, { x: left, y, font: bold, size: 11 });
    y -= 16;
    page.drawText(`Best scenario: ${best.scenarioName}`, { x: left, y, font: bold, size: 11 });

    y -= 26;
    page.drawText('Compact comparison table', { x: left, y, font: bold, size: 12 });
    y -= 16;

    page.drawText('Scenario', { x: left, y, font: bold, size: 10 });
    page.drawText('Total', { x: 260, y, font: bold, size: 10 });
    page.drawText('Unit', { x: 380, y, font: bold, size: 10 });
    page.drawText('Delta', { x: 470, y, font: bold, size: 10 });
    y -= 12;

    for (const item of sorted.slice(0, 6)) {
      const delta = item.summary.landedTotal - baseline.summary.landedTotal;
      page.drawText(item.scenarioName, { x: left, y, font: regular, size: 10 });
      page.drawText(formatCurrency(item.summary.landedTotal, locale, currency), { x: 260, y, font: regular, size: 10 });
      page.drawText(formatCurrency(item.summary.landedUnitWeighted, locale, currency), { x: 380, y, font: regular, size: 10 });
      page.drawText(`${delta >= 0 ? '+' : ''}${formatCurrency(delta, locale, currency)}`, { x: 470, y, font: regular, size: 10 });
      y -= 14;
    }

    y -= 20;
    const recommendation = `Based on provided assumptions, ${best.scenarioName} has the lowest estimated landed cost per unit. Estimated savings vs baseline: ${formatCurrency(savings, locale, currency)} (${savingsPct.toFixed(1)}%).`;
    page.drawText('Recommendation', { x: left, y, font: bold, size: 11 });
    y -= 14;
    page.drawText(recommendation, { x: left, y, font: regular, size: 10, maxWidth: 500, lineHeight: 13 });

    y -= 52;
    page.drawText('Disclaimer: This document is an operational estimate based on user-provided assumptions (transport, duty, ancillary fees, and optional sales prices). It is not legal, customs, or accounting advice.', {
      x: left,
      y,
      font: regular,
      size: 9,
      maxWidth: 500,
      lineHeight: 12,
      color: rgb(0.35, 0.38, 0.45),
    });

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="import-margin-guard-${analysisId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'PDF generation failed' }, { status: 500 });
  }
}

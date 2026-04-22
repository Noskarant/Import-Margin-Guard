import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { calculateScenario } from '@/features/scenarios/lib/calculate';
import { getAnalysis, getImport, getOrganization } from '@/lib/demo-store';

function formatCurrency(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function confidenceLabel(marginPct?: number) {
  return typeof marginPct === 'number' ? 'High' : 'Medium';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const analysisId = String(body.analysisId ?? '');
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    const analysis = await getAnalysis(analysisId);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const importRecord = await getImport(analysis.importId);
    if (!importRecord || importRecord.mappedRows.length === 0) {
      return NextResponse.json({ error: 'Mapped import rows not found' }, { status: 400 });
    }

    const organization = await getOrganization(analysis.orgId);
    const locale = organization?.country === 'FR' ? 'fr-FR' : 'en-US';
    const currency = organization?.currency ?? 'EUR';

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

    const sorted = [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted);
    const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
    const best = sorted[0];

    if (!baseline || !best) {
      return NextResponse.json({ error: 'At least one scenario is required' }, { status: 400 });
    }

    const savings = baseline.summary.landedTotal - best.summary.landedTotal;
    const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;
    const marginImpact = typeof baseline.summary.marginPct === 'number' && typeof best.summary.marginPct === 'number'
      ? (best.summary.marginPct - baseline.summary.marginPct) * 100
      : undefined;

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 800;
    const left = 48;
    const line = 14;

    const drawTextBlock = (text: string, size = 10, maxWidth = 500, color = rgb(0.06, 0.09, 0.16), font = regular) => {
      const lines = text.split('\n');
      for (const entry of lines) {
        page.drawText(entry, { x: left, y, font, size, color, maxWidth, lineHeight: line });
        y -= line;
      }
    };

    page.drawText('Import Margin Guard - Comparison Summary', {
      x: left,
      y,
      font: bold,
      size: 16,
      color: rgb(0.06, 0.09, 0.16),
    });
    y -= 28;

    drawTextBlock(`Analysis: ${analysis.title}`, 11);
    drawTextBlock(`Organization: ${organization?.name ?? 'N/A'}`, 11);
    drawTextBlock(`Export date: ${new Date().toLocaleDateString(locale)}`, 11);
    y -= 10;

    page.drawText('Executive summary', { x: left, y, font: bold, size: 12 });
    y -= 18;
    drawTextBlock(`Recommended scenario: ${best.scenarioName}`, 10);
    drawTextBlock(`Estimated savings vs baseline: ${formatCurrency(savings, locale, currency)} (${savingsPct.toFixed(1)}%)`, 10);
    if (typeof marginImpact === 'number') {
      drawTextBlock(`Estimated gross margin vs baseline: ${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)} pts`, 10);
    } else {
      drawTextBlock('Estimated gross margin vs baseline: not available', 10);
    }
    if (best.notes) {
      drawTextBlock(`Scenario notes: ${best.notes}`, 10);
    }
    y -= 10;

    page.drawText('Compact comparison table', { x: left, y, font: bold, size: 12 });
    y -= 18;

    page.drawText('Scenario', { x: left, y, font: bold, size: 10 });
    page.drawText('Total', { x: 240, y, font: bold, size: 10 });
    page.drawText('Unit', { x: 340, y, font: bold, size: 10 });
    page.drawText('Delta', { x: 420, y, font: bold, size: 10 });
    page.drawText('Confidence', { x: 500, y, font: bold, size: 10 });
    y -= 14;

    for (const item of sorted.slice(0, 8)) {
      const delta = item.summary.landedTotal - baseline.summary.landedTotal;
      page.drawText(item.scenarioName.slice(0, 28), { x: left, y, font: regular, size: 9 });
      page.drawText(formatCurrency(item.summary.landedTotal, locale, currency), { x: 240, y, font: regular, size: 9 });
      page.drawText(formatCurrency(item.summary.landedUnitWeighted, locale, currency), { x: 340, y, font: regular, size: 9 });
      page.drawText(`${delta >= 0 ? '+' : ''}${formatCurrency(delta, locale, currency)}`, { x: 420, y, font: regular, size: 9 });
      page.drawText(confidenceLabel(item.summary.marginPct), { x: 500, y, font: regular, size: 9 });
      y -= 13;
    }

    y -= 14;
    page.drawText('Recommendation note', { x: left, y, font: bold, size: 12 });
    y -= 18;
    drawTextBlock(
      `Based on the assumptions entered on ${new Date().toLocaleDateString(locale)}, ${best.scenarioName} shows the lowest estimated landed cost per unit. Estimated savings vs baseline: ${formatCurrency(savings, locale, currency)} (${savingsPct.toFixed(1)}%).`,
      10,
    );
    y -= 10;

    page.drawText('Disclaimer', { x: left, y, font: bold, size: 11 });
    y -= 16;
    drawTextBlock(
      'This document is an operational estimate based on user-provided assumptions (purchase price, transport, duty, ancillary fees, and optional sales prices). It is not legal, customs, tax, or accounting advice.',
      9,
      500,
      rgb(0.35, 0.38, 0.45),
    );

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

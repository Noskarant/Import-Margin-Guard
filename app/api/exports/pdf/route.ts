import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { calculateScenario } from '@/features/scenarios/lib/calculate';
import { getAnalysis, getImport, getOrganization } from '@/lib/demo-store';

function sanitizeText(value: string) {
  return value
    .replace(/[\u202F\u00A0]/g, ' ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

function formatCurrency(value: number, locale: string, currency: string) {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
  return sanitizeText(formatted);
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

    const colors = {
      text: rgb(0.06, 0.09, 0.16),
      muted: rgb(0.35, 0.38, 0.45),
      border: rgb(0.86, 0.89, 0.93),
      surface: rgb(0.97, 0.98, 0.99),
      header: rgb(0.93, 0.95, 0.98),
      accent: rgb(0.11, 0.31, 0.85),
    };

    let y = 796;
    const left = 48;
    const right = 547;
    const contentWidth = right - left;

    const drawRule = (offset = 0) => {
      page.drawLine({
        start: { x: left, y: y - offset },
        end: { x: right, y: y - offset },
        thickness: 1,
        color: colors.border,
      });
    };

    const drawWrappedText = (
      text: string,
      options?: { x?: number; yPos?: number; size?: number; maxWidth?: number; font?: typeof regular; color?: ReturnType<typeof rgb>; lineGap?: number },
    ) => {
      const x = options?.x ?? left;
      const yPos = options?.yPos ?? y;
      const size = options?.size ?? 10;
      const maxWidth = options?.maxWidth ?? contentWidth;
      const font = options?.font ?? regular;
      const color = options?.color ?? colors.text;
      const lineGap = options?.lineGap ?? 4;
      const safeText = sanitizeText(text);
      const words = safeText.split(/\s+/);
      const lines: string[] = [];
      let current = '';

      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
          current = next;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);

      let currentY = yPos;
      for (const line of lines) {
        page.drawText(line, { x, y: currentY, font, size, color });
        currentY -= size + lineGap;
      }
      return currentY;
    };

    const drawSectionTitle = (title: string) => {
      page.drawText(title, { x: left, y, font: bold, size: 13, color: colors.text });
      y -= 8;
      drawRule(0);
      y -= 18;
    };

    page.drawText('Import Margin Guard - Comparison Summary', {
      x: left,
      y,
      font: bold,
      size: 18,
      color: colors.text,
    });
    page.drawText('Operational export', {
      x: right - 88,
      y: y + 2,
      font: regular,
      size: 10,
      color: colors.accent,
    });
    y -= 16;
    drawRule();
    y -= 22;

    const metaRows = [
      ['Analysis', analysis.title],
      ['Organization', organization?.name ?? 'N/A'],
      ['Export date', new Date().toLocaleDateString(locale)],
    ];

    for (const [label, value] of metaRows) {
      page.drawText(`${label}:`, { x: left, y, font: bold, size: 10.5, color: colors.text });
      page.drawText(sanitizeText(value), { x: left + 92, y, font: regular, size: 10.5, color: colors.text });
      y -= 16;
    }
    y -= 8;

    page.drawRectangle({ x: left, y: y - 78, width: contentWidth, height: 86, color: colors.surface, borderColor: colors.border, borderWidth: 1 });
    page.drawText('Executive summary', { x: left + 12, y: y - 18, font: bold, size: 13, color: colors.text });
    page.drawText(`Recommended scenario: ${sanitizeText(best.scenarioName)}`, { x: left + 12, y: y - 38, font: regular, size: 10.5, color: colors.text });
    page.drawText(`Estimated savings vs baseline: ${formatCurrency(savings, locale, currency)} (${savingsPct.toFixed(1)}%)`, { x: left + 12, y: y - 54, font: regular, size: 10.5, color: colors.text });
    page.drawText(
      `Estimated gross margin vs baseline: ${typeof marginImpact === 'number' ? `${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)} pts` : 'Not available'}`,
      { x: left + 12, y: y - 70, font: regular, size: 10.5, color: colors.text },
    );
    y -= 102;

    if (best.notes) {
      drawSectionTitle('Scenario note');
      y = drawWrappedText(best.notes, { size: 10.5, color: colors.text, lineGap: 5 });
      y -= 14;
    }

    drawSectionTitle('Compact comparison table');

    const rowHeight = 22;
    const colScenario = left + 8;
    const colTotal = left + 200;
    const colUnit = left + 310;
    const colDelta = left + 390;
    const colConfidence = left + 470;

    page.drawRectangle({ x: left, y: y - rowHeight + 6, width: contentWidth, height: rowHeight, color: colors.header, borderColor: colors.border, borderWidth: 1 });
    page.drawText('Scenario', { x: colScenario, y: y - 9, font: bold, size: 10, color: colors.text });
    page.drawText('Total', { x: colTotal, y: y - 9, font: bold, size: 10, color: colors.text });
    page.drawText('Unit', { x: colUnit, y: y - 9, font: bold, size: 10, color: colors.text });
    page.drawText('Delta', { x: colDelta, y: y - 9, font: bold, size: 10, color: colors.text });
    page.drawText('Confidence', { x: colConfidence, y: y - 9, font: bold, size: 10, color: colors.text });
    y -= 30;

    sorted.slice(0, 8).forEach((item, index) => {
      const delta = item.summary.landedTotal - baseline.summary.landedTotal;
      if (index % 2 === 0) {
        page.drawRectangle({ x: left, y: y - 12, width: contentWidth, height: 18, color: colors.surface });
      }
      page.drawText(sanitizeText(item.scenarioName.slice(0, 28)), { x: colScenario, y, font: regular, size: 9.5, color: colors.text });
      page.drawText(formatCurrency(item.summary.landedTotal, locale, currency), { x: colTotal, y, font: regular, size: 9.5, color: colors.text });
      page.drawText(formatCurrency(item.summary.landedUnitWeighted, locale, currency), { x: colUnit, y, font: regular, size: 9.5, color: colors.text });
      page.drawText(sanitizeText(`${delta >= 0 ? '+' : ''}${formatCurrency(delta, locale, currency)}`), { x: colDelta, y, font: regular, size: 9.5, color: colors.text });
      page.drawText(confidenceLabel(item.summary.marginPct), { x: colConfidence, y, font: regular, size: 9.5, color: colors.text });
      y -= 18;
    });

    y -= 12;
    drawSectionTitle('Recommendation note');
    y = drawWrappedText(
      `Based on the assumptions entered on ${new Date().toLocaleDateString(locale)}, ${best.scenarioName} shows the lowest estimated landed cost per unit. Estimated savings vs baseline: ${formatCurrency(savings, locale, currency)} (${savingsPct.toFixed(1)}%).${typeof marginImpact === 'number' ? ` Estimated gross margin vs baseline: ${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)} pts.` : ''}`,
      { size: 10.5, lineGap: 5 },
    );

    y -= 18;
    drawSectionTitle('Disclaimer');
    y = drawWrappedText(
      'This document is an operational estimate based on user-provided assumptions (purchase price, transport, duty, ancillary fees, and optional sales prices). It is not legal, customs, tax, or accounting advice.',
      { size: 9.5, color: colors.muted, lineGap: 5 },
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

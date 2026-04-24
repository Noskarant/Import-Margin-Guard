import { NextRequest, NextResponse } from 'next/server';
import { commitImport, getImport, saveOrgMapping } from '@/lib/data-store';

const REQUIRED_TARGETS = [
  'sku',
  'supplier',
  'country',
  'unitPurchasePrice',
  'quantity',
  'currency',
  'transportCost',
  'dutyRate',
  'incoterm',
  'ancillaryFees',
] as const;

type Mapping = Record<string, string>;

const INCOTERMS = new Set(['EXW', 'FCA', 'FOB', 'CIF', 'DDP']);

function parseFrenchNumber(value: string | undefined, field: string) {
  const normalized = (value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) throw new Error(`Invalid numeric value for ${field}`);
  return parsed;
}

function parseOptionalFrenchNumber(value: string | undefined, field: string) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  return parseFrenchNumber(trimmed, field);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const importId = String(body.importId ?? '');
    const mapping = body.mapping as Mapping;
    const previewRows = body.previewRows as Record<string, string>[];

    if (!importId) return NextResponse.json({ error: 'importId is required' }, { status: 400 });
    if (!mapping || !previewRows) return NextResponse.json({ error: 'mapping and previewRows are required' }, { status: 400 });

    for (const target of REQUIRED_TARGETS) {
      if (!mapping[target]) return NextResponse.json({ error: `Missing required mapping for ${target}` }, { status: 400 });
    }

    const normalizedRows = previewRows.map((row, index) => {
      const incoterm = String(row[mapping.incoterm] ?? '').toUpperCase();
      if (!INCOTERMS.has(incoterm)) {
        throw new Error(`Invalid incoterm at row ${index + 1}`);
      }
      return {
        rowIndex: index,
        sku: String(row[mapping.sku] ?? ''),
        supplier: String(row[mapping.supplier] ?? ''),
        country: String(row[mapping.country] ?? '').toUpperCase(),
        unitPurchasePrice: parseFrenchNumber(row[mapping.unitPurchasePrice], 'unitPurchasePrice'),
        quantity: parseFrenchNumber(row[mapping.quantity], 'quantity'),
        currency: String(row[mapping.currency] ?? 'EUR').toUpperCase(),
        transportCost: parseFrenchNumber(row[mapping.transportCost], 'transportCost'),
        dutyRate: parseFrenchNumber(row[mapping.dutyRate], 'dutyRate'),
        incoterm,
        ancillaryFees: parseFrenchNumber(row[mapping.ancillaryFees], 'ancillaryFees'),
        salesPrice: row[mapping.salesPrice] ? parseFrenchNumber(row[mapping.salesPrice], 'salesPrice') : undefined,
        weightKg: mapping.weightKg ? parseOptionalFrenchNumber(row[mapping.weightKg], 'weightKg') : undefined,
        volumeM3: mapping.volumeM3 ? parseOptionalFrenchNumber(row[mapping.volumeM3], 'volumeM3') : undefined,
      };
    });

    const record = await getImport(importId);
    if (!record) return NextResponse.json({ error: 'Import not found' }, { status: 404 });

    await commitImport(importId, normalizedRows);
    await saveOrgMapping({ orgId: record.orgId, headers: record.headers, mapping });

    return NextResponse.json({ importId, rowCount: normalizedRows.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

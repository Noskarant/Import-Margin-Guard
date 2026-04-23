import { NextResponse } from 'next/server';
import { findSavedMappingForImport, getImport } from '@/lib/demo-store';

export async function GET(_: Request, { params }: { params: Promise<{ importId: string }> }) {
  const { importId } = await params;
  const record = await getImport(importId);
  if (!record) {
    return NextResponse.json({ error: 'Import not found' }, { status: 404 });
  }

  const savedMapping = await findSavedMappingForImport(record.orgId, record.headers);

  return NextResponse.json({
    ...record,
    suggestedMapping: savedMapping?.mapping ?? null,
    mappingSource: savedMapping ? 'saved' : 'suggested',
  });
}

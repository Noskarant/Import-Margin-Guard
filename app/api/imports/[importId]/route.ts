import { NextResponse } from 'next/server';
import { findOrgForUser, findSavedMappingForImport, getImport } from '@/lib/demo-store';
import { requireUserId } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ importId: string }> }) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const { importId } = await params;
    const record = await getImport(importId);
    if (!record || record.orgId !== org.id) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    }

    const savedMapping = await findSavedMappingForImport(record.orgId, record.headers);

    return NextResponse.json({
      ...record,
      suggestedMapping: savedMapping?.mapping ?? null,
      mappingSource: savedMapping ? 'saved' : 'suggested',
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

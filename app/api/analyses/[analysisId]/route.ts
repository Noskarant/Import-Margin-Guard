import { NextRequest, NextResponse } from 'next/server';
import { findOrgForUser, getAnalysis, getImport, saveAnalysis } from '@/lib/demo-store';
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
    if (!importRecord || importRecord.orgId !== org.id) return NextResponse.json({ error: 'Import not found' }, { status: 404 });

    return NextResponse.json({ analysis, importRecord });
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
    const title = String(body.title ?? '').trim();
    const status = String(body.status ?? 'saved') as 'draft' | 'saved';

    const updated = await saveAnalysis(analysisId, (analysis) => {
      if (title) analysis.title = title;
      analysis.status = status;
    });

    return NextResponse.json({ analysis: updated });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

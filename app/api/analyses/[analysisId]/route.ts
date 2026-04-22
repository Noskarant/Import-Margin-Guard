import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis, getImport, saveAnalysis } from '@/lib/demo-store';

export async function GET(_: Request, { params }: { params: Promise<{ analysisId: string }> }) {
  const { analysisId } = await params;
  const analysis = await getAnalysis(analysisId);
  if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

  const importRecord = await getImport(analysis.importId);
  return NextResponse.json({ analysis, importRecord });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ analysisId: string }> }) {
  try {
    const { analysisId } = await params;
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    const status = String(body.status ?? 'saved') as 'draft' | 'saved';

    const updated = await saveAnalysis(analysisId, (analysis) => {
      if (title) analysis.title = title;
      analysis.status = status;
    });

    return NextResponse.json({ analysis: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

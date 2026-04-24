import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis, findOrgForUser, listAnalyses } from '@/lib/data-store';
import { requireUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ analyses: [] });
    const analyses = await listAnalyses(org.id);
    return NextResponse.json({ analyses });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const body = await request.json();
    const importId = String(body.importId ?? '');
    const title = String(body.title ?? '').trim() || 'Untitled analysis';
    if (!importId) return NextResponse.json({ error: 'importId is required' }, { status: 400 });

    const analysis = await createAnalysis({ orgId: org.id, importId, title, createdBy: userId });
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

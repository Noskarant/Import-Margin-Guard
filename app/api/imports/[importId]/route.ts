import { NextResponse } from 'next/server';
import { getImport } from '@/lib/demo-store';

export async function GET(_: Request, { params }: { params: Promise<{ importId: string }> }) {
  const { importId } = await params;
  const record = await getImport(importId);
  if (!record) {
    return NextResponse.json({ error: 'Import not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

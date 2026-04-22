import { NextRequest, NextResponse } from 'next/server';
import { parseCsvPreview } from '@/features/imports/lib/parse';
import { createImport, findOrgForUser } from '@/lib/demo-store';
import { requireUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create an organization first' }, { status: 400 });

    const body = await request.json();
    const fileName = String(body.fileName ?? 'upload.csv');
    const fileType = String(body.fileType ?? 'text/csv');
    const fileText = String(body.fileText ?? '');

    if (!fileText) return NextResponse.json({ error: 'fileText is required' }, { status: 400 });
    if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'XLSX preview not enabled in this demo. Please upload CSV for MVP demo.' }, { status: 400 });
    }

    const preview = parseCsvPreview(fileText);
    const record = await createImport({
      orgId: org.id,
      uploadedBy: userId,
      fileName,
      headers: preview.headers,
      previewRows: preview.rows,
    });

    return NextResponse.json({ importId: record.id, ...preview });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

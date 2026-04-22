import { NextRequest, NextResponse } from 'next/server';
import { calculateScenario } from '@/features/scenarios/lib/calculate';
import { scenarioSchema } from '@/features/scenarios/schemas/scenario';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = scenarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const summary = calculateScenario(parsed.data.rows);
  return NextResponse.json({ name: parsed.data.name, summary, estimate: true });
}

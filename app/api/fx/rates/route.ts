import { NextRequest, NextResponse } from 'next/server';

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const base = normalizeCurrency(searchParams.get('base') ?? 'EUR');
    const symbols = (searchParams.get('symbols') ?? '')
      .split(',')
      .map(normalizeCurrency)
      .filter((item) => item && item !== base);

    if (symbols.length === 0) {
      return NextResponse.json({ base, rates: {}, source: 'frankfurter.app' });
    }

    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(symbols.join(','))}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`FX provider returned ${response.status}`);
    }

    const payload = await response.json();
    const providerRates = payload.rates ?? {};
    const ratesToBase = Object.fromEntries(
      Object.entries(providerRates)
        .map(([currency, rate]) => [currency, 1 / Number(rate)])
        .filter(([, rate]) => Number.isFinite(rate) && rate > 0),
    );

    return NextResponse.json({
      base,
      rates: ratesToBase,
      source: 'frankfurter.app',
      date: payload.date,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

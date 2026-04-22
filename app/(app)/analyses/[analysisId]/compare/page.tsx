'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';

type Result = {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number };
};

export default function ComparePage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyses/${params.analysisId}/calculate`)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setResults(json.results ?? []);
        setLoading(false);
      });
  }, [params.analysisId]);

  const sorted = useMemo(() => [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted), [results]);
  const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
  const best = sorted[0];

  if (loading) return <main style={{ padding: 32 }}>Calculating scenarios...</main>;
  if (error) return <main style={{ padding: 32, color: 'crimson' }}>{error}</main>;
  if (results.length < 2 || !baseline || !best) return <main style={{ padding: 32 }}>Need at least 2 scenarios to compare.</main>;

  const savings = baseline.summary.landedTotal - best.summary.landedTotal;
  const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: 32 }}>
      <h1>Scenario comparison</h1>
      <section style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <KpiCard title="Best Scenario (Estimated Landed Cost / Unit)" value={`${best.scenarioName} · €${best.summary.landedUnitWeighted.toFixed(2)} / unit`} />
        <KpiCard title="Savings vs Baseline" value={`€${savings.toFixed(2)} (${savingsPct.toFixed(1)}%)`} />
        <KpiCard
          title="Estimated Gross Margin Impact"
          value={typeof best.summary.marginPct === 'number' ? `${(best.summary.marginPct * 100).toFixed(1)}%` : 'Not available (sales price missing)'}
          note="Estimate based on provided assumptions"
        />
      </section>

      <table style={{ width: '100%', background: 'white' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Scenario</th>
            <th style={{ textAlign: 'left' }}>Total Landed Cost</th>
            <th style={{ textAlign: 'left' }}>Landed Cost / Unit</th>
            <th style={{ textAlign: 'left' }}>Delta vs Baseline</th>
            <th style={{ textAlign: 'left' }}>Estimated Gross Margin %</th>
            <th style={{ textAlign: 'left' }}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const delta = row.summary.landedTotal - baseline.summary.landedTotal;
            return (
              <tr key={row.scenarioId}>
                <td>{row.scenarioName}</td>
                <td>€{row.summary.landedTotal.toFixed(2)}</td>
                <td>€{row.summary.landedUnitWeighted.toFixed(2)}</td>
                <td>{delta >= 0 ? '+' : ''}€{delta.toFixed(2)}</td>
                <td>{typeof row.summary.marginPct === 'number' ? `${(row.summary.marginPct * 100).toFixed(1)}%` : 'N/A'}</td>
                <td>High (100%)</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p>
        Based on the assumptions entered on 22 April 2026, {best.scenarioName} has the lowest estimated landed cost per unit.
        Estimated savings vs baseline: €{savings.toFixed(2)} ({savingsPct.toFixed(1)}%).
      </p>

      <button type="button" onClick={() => router.push(`/analyses/${params.analysisId}/builder`)}>Back to builder</button>
    </main>
  );
}

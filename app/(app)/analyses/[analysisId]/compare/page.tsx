'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';

type Result = { scenarioId: string; scenarioName: string; isBaseline: boolean; summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number } };

export default function ComparePage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyses/${params.analysisId}/calculate`).then((response) => response.json()).then((json) => {
      if (json.error) setError(json.error); else setResults(json.results ?? []);
      setLoading(false);
    });
  }, [params.analysisId]);

  const sorted = useMemo(() => [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted), [results]);
  const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
  const best = sorted[0];

  if (loading) return <main className="content-wrap"><div className="card">Calculating scenarios...</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;
  if (results.length < 2 || !baseline || !best) return <main className="content-wrap"><div className="alert warn">At least 2 scenarios are required for comparison.</div></main>;

  const savings = baseline.summary.landedTotal - best.summary.landedTotal;
  const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;

  return (
    <main className="content-wrap">
      <header className="page-head"><h1>Scenario comparison</h1><p>Review estimated landed-cost outcomes side by side before making sourcing decisions.</p></header>
      <section className="grid-3" style={{ marginTop: 16 }}>
        <KpiCard title="Best Scenario (Estimated Landed Cost / Unit)" value={`${best.scenarioName} · €${best.summary.landedUnitWeighted.toFixed(2)} / unit`} note="Lower is better" />
        <KpiCard title="Savings vs Baseline" value={`€${savings.toFixed(2)} (${savingsPct.toFixed(1)}%)`} note="Estimate vs baseline assumptions" />
        <KpiCard title="Estimated Gross Margin Impact" value={typeof best.summary.marginPct === 'number' ? `${(best.summary.marginPct * 100).toFixed(1)}%` : 'Not available'} note="Shown when sales prices are provided" />
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Comparison table</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Scenario</th><th className="td-num">Total Landed Cost</th><th className="td-num">Landed Cost / Unit</th><th className="td-num">Delta vs Baseline</th><th className="td-num">Estimated Gross Margin %</th><th>Confidence</th></tr></thead>
            <tbody>
              {sorted.map((row) => {
                const delta = row.summary.landedTotal - baseline.summary.landedTotal;
                const isBest = row.scenarioId === best.scenarioId;
                const isBase = row.scenarioId === baseline.scenarioId;
                return (
                  <tr key={row.scenarioId} style={isBest ? { background: '#f0fdf4' } : isBase ? { background: '#eff6ff' } : undefined}>
                    <td>{row.scenarioName} {isBase ? <span className="badge">Baseline</span> : null}</td>
                    <td className="td-num">€{row.summary.landedTotal.toFixed(2)}</td>
                    <td className="td-num">€{row.summary.landedUnitWeighted.toFixed(2)}</td>
                    <td className="td-num">{delta >= 0 ? '+' : ''}€{delta.toFixed(2)}</td>
                    <td className="td-num">{typeof row.summary.marginPct === 'number' ? `${(row.summary.marginPct * 100).toFixed(1)}%` : <span className="muted">N/A</span>}</td>
                    <td><span className="badge success">High</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recommendation note</h2>
        <p style={{ marginBottom: 0 }}>Based on the assumptions entered on 22 April 2026, {best.scenarioName} shows the lowest estimated landed cost per unit. Estimated savings vs baseline: €{savings.toFixed(2)} ({savingsPct.toFixed(1)}%).</p>
      </section>

      <div className="actions"><button className="btn btn-secondary" onClick={() => router.push(`/analyses/${params.analysisId}/builder`)}>Back to builder</button></div>
    </main>
  );
}

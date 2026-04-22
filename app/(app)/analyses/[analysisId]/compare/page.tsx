'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';

type Result = {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  notes?: string;
  summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number };
};

function confidenceLabel(row: Result) {
  if (typeof row.summary.marginPct === 'number') return 'High';
  return 'Medium';
}

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

  const savings = baseline && best ? baseline.summary.landedTotal - best.summary.landedTotal : 0;
  const savingsPct = baseline && best && baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;
  const marginImpact = baseline && best && typeof baseline.summary.marginPct === 'number' && typeof best.summary.marginPct === 'number'
    ? (best.summary.marginPct - baseline.summary.marginPct) * 100
    : undefined;

  const executiveReasons = useMemo(() => {
    if (!baseline || !best) return [] as string[];
    const reasons: string[] = [];
    if (best.summary.landedUnitWeighted < baseline.summary.landedUnitWeighted) {
      reasons.push(`Estimated landed cost per unit is ${Math.abs(savingsPct).toFixed(1)}% lower than the baseline.`);
    }
    if (typeof marginImpact === 'number') {
      reasons.push(`Estimated gross margin changes by ${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)} pts versus the baseline.`);
    }
    if (best.notes) {
      reasons.push(best.notes);
    }
    return reasons.slice(0, 3);
  }, [baseline, best, marginImpact, savingsPct]);

  const alerts = useMemo(() => {
    if (!baseline || !best) return [] as Array<{ title: string; text: string; tone: 'warn' | 'success' }>;
    const items: Array<{ title: string; text: string; tone: 'warn' | 'success' }> = [];

    if (savings <= 0) {
      items.push({ title: 'No savings detected', text: 'The current best scenario does not reduce total landed cost versus the baseline. Check assumptions before using it as a recommendation.', tone: 'warn' });
    } else {
      items.push({ title: 'Savings detected', text: `The selected best scenario saves an estimated €${savings.toFixed(2)} versus the baseline.`, tone: 'success' });
    }

    if (typeof best.summary.marginPct !== 'number') {
      items.push({ title: 'Margin not available', text: 'Sales prices are missing on some or all rows, so gross margin cannot be fully evaluated.', tone: 'warn' });
    } else if (best.summary.marginPct < 0.2) {
      items.push({ title: 'Low estimated margin', text: `Estimated gross margin is ${(best.summary.marginPct * 100).toFixed(1)}%, which may be too low depending on your target margin threshold.`, tone: 'warn' });
    }

    if (best.summary.landedUnitWeighted > baseline.summary.landedUnitWeighted * 1.15) {
      items.push({ title: 'Cost increase is material', text: 'The best currently selected option still increases landed cost per unit materially versus the baseline. Review purchase, transport, and duty assumptions.', tone: 'warn' });
    }

    return items;
  }, [baseline, best, savings]);

  if (loading) return <main className="content-wrap"><div className="card">Calculating scenarios...</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;
  if (results.length < 2 || !baseline || !best) return <main className="content-wrap"><div className="alert warn">At least 2 scenarios are required for comparison.</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>Scenario comparison</h1>
        <p>Review estimated landed-cost outcomes side by side before making sourcing decisions.</p>
      </header>

      <section className="grid-3" style={{ marginTop: 16 }}>
        <KpiCard title="Best Scenario (Estimated Landed Cost / Unit)" value={`${best.scenarioName} · €${best.summary.landedUnitWeighted.toFixed(2)} / unit`} note="Lower is better" />
        <KpiCard title="Savings vs Baseline" value={`€${savings.toFixed(2)} (${savingsPct.toFixed(1)}%)`} note="Estimate vs baseline assumptions" />
        <KpiCard title="Estimated Gross Margin Impact" value={typeof best.summary.marginPct === 'number' ? `${(best.summary.marginPct * 100).toFixed(1)}%` : 'Not available'} note="Shown when sales prices are provided" />
      </section>

      <section className="grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>What to retain</h2>
          <div className="stack-sm">
            <div>
              <p className="kpi-title">Recommended scenario</p>
              <p className="kpi-value" style={{ fontSize: 20 }}>{best.scenarioName}</p>
            </div>
            <div>
              <p className="kpi-title">Operational rationale</p>
              <div className="highlight-list">
                {executiveReasons.length > 0 ? executiveReasons.map((reason, index) => (
                  <div className="highlight-item" key={index}>{reason}</div>
                )) : <div className="highlight-item">No scenario note has been added yet. Use builder notes to explain the business intent behind each option.</div>}
              </div>
            </div>
          </div>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>Automatic checks</h2>
          <div className="highlight-list">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={index} className={`alert ${alert.tone === 'warn' ? 'warn' : 'success'}`}>
                <strong>{alert.title}</strong>
                <div>{alert.text}</div>
              </div>
            )) : <div className="alert success"><strong>No critical issue detected.</strong><div>The current best scenario looks directionally stronger than the baseline.</div></div>}
          </div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Comparison table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th className="td-num">Total Landed Cost</th>
                <th className="td-num">Landed Cost / Unit</th>
                <th className="td-num">Delta vs Baseline</th>
                <th className="td-num">Estimated Gross Margin %</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const delta = row.summary.landedTotal - baseline.summary.landedTotal;
                const isBest = row.scenarioId === best.scenarioId;
                const isBase = row.scenarioId === baseline.scenarioId;
                return (
                  <tr key={row.scenarioId} style={isBest ? { background: '#f0fdf4' } : isBase ? { background: '#eff6ff' } : undefined}>
                    <td>
                      {row.scenarioName} {isBase ? <span className="badge">Baseline</span> : null}
                      {row.notes ? <div className="muted" style={{ marginTop: 4 }}>{row.notes}</div> : null}
                    </td>
                    <td className="td-num">€{row.summary.landedTotal.toFixed(2)}</td>
                    <td className="td-num">€{row.summary.landedUnitWeighted.toFixed(2)}</td>
                    <td className="td-num">{delta >= 0 ? '+' : ''}€{delta.toFixed(2)}</td>
                    <td className="td-num">{typeof row.summary.marginPct === 'number' ? `${(row.summary.marginPct * 100).toFixed(1)}%` : <span className="muted">N/A</span>}</td>
                    <td><span className={`badge ${confidenceLabel(row) === 'High' ? 'success' : 'warn'}`}>{confidenceLabel(row)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recommendation note</h2>
        <p style={{ marginBottom: 0 }}>
          Based on the assumptions entered on 22 April 2026, {best.scenarioName} shows the lowest estimated landed cost per unit.
          Estimated savings vs baseline: €{savings.toFixed(2)} ({savingsPct.toFixed(1)}%).
          {typeof marginImpact === 'number' ? ` Estimated gross margin vs baseline: ${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)} pts.` : ''}
        </p>
      </section>

      <div className="actions">
        <button className="btn btn-secondary" onClick={() => router.push(`/analyses/${params.analysisId}/builder`)}>Back to builder</button>
      </div>
    </main>
  );
}

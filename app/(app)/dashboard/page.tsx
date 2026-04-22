'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Org = { id: string; name: string; country: string; currency: string };
type Analysis = { id: string; title: string; updatedAt: string; status?: string };
type ComparisonResult = {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  notes?: string;
  summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number };
};

type RecentOutcome = {
  analysisId: string;
  title: string;
  updatedAt: string;
  bestScenarioName: string;
  savings: number;
  savingsPct: number;
  marginPct?: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [recentOutcomes, setRecentOutcomes] = useState<RecentOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const orgResponse = await fetch('/api/org');
      if (orgResponse.status === 401) return router.push('/sign-in');
      const orgJson = await orgResponse.json();
      if (!orgJson.organization) return router.push('/onboarding');
      setOrg(orgJson.organization);

      const analysesResponse = await fetch('/api/analyses');
      const analysesJson = await analysesResponse.json();
      const recentAnalyses: Analysis[] = analysesJson.analyses ?? [];
      setAnalyses(recentAnalyses);

      const outcomes = await Promise.all(
        recentAnalyses.slice(0, 3).map(async (analysis) => {
          try {
            const response = await fetch(`/api/analyses/${analysis.id}/calculate`);
            const json = await response.json();
            if (!response.ok || json.error) return null;

            const results: ComparisonResult[] = json.results ?? [];
            if (results.length < 2) return null;

            const sorted = [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted);
            const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
            const best = sorted[0];
            if (!baseline || !best) return null;

            const savings = baseline.summary.landedTotal - best.summary.landedTotal;
            const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;

            return {
              analysisId: analysis.id,
              title: analysis.title,
              updatedAt: analysis.updatedAt,
              bestScenarioName: best.scenarioName,
              savings,
              savingsPct,
              marginPct: best.summary.marginPct,
            } satisfies RecentOutcome;
          } catch {
            return null;
          }
        }),
      );

      setRecentOutcomes(outcomes.filter((item): item is RecentOutcome => item !== null));
      setLoading(false);
    }

    load().catch((err) => {
      setError(String(err));
      setLoading(false);
    });
  }, [router]);

  const totalSavings = recentOutcomes.reduce((acc, item) => acc + Math.max(item.savings, 0), 0);

  if (loading) return <main className="content-wrap"><div className="card">Loading dashboard...</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>Dashboard</h1>
        <p>Track your workspace status and launch new import scenario analyses quickly.</p>
      </header>

      <section className="grid-3" style={{ marginTop: 16 }}>
        <article className="card">
          <p className="kpi-title">Organization</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>{org?.name}</p>
          <p className="muted">{org?.country} · {org?.currency}</p>
        </article>
        <article className="card">
          <p className="kpi-title">Plan status</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>Trial</p>
          <span className="badge warn">14 days</span>
        </article>
        <article className="card">
          <p className="kpi-title">Analyses used</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>{analyses.length} / 5</p>
          <p className="muted">Recent estimated savings: €{totalSavings.toFixed(2)}</p>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Start a new import analysis</h2>
        <p className="muted">Upload a source file, map columns, and compare baseline vs alternative sourcing scenarios.</p>
        <Link href="/imports/new" className="btn btn-primary">New import analysis</Link>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recent comparison outcomes</h2>
        {recentOutcomes.length === 0 ? (
          <div className="alert warn">No completed comparison result yet. Run a comparison to surface the best scenario and estimated savings here.</div>
        ) : (
          <div className="insight-grid">
            {recentOutcomes.map((outcome) => (
              <article key={outcome.analysisId} className="insight-card">
                <h3>{outcome.title}</h3>
                <p className="muted" style={{ margin: 0 }}>Recommended scenario: <strong>{outcome.bestScenarioName}</strong></p>
                <div className="insight-meta">
                  <span>Estimated savings: €{outcome.savings.toFixed(2)} ({outcome.savingsPct.toFixed(1)}%)</span>
                  <span>Estimated margin: {typeof outcome.marginPct === 'number' ? `${(outcome.marginPct * 100).toFixed(1)}%` : 'N/A'}</span>
                  <span>Updated: {new Date(outcome.updatedAt).toLocaleString('fr-FR')}</span>
                </div>
                <div className="actions">
                  <Link className="btn btn-secondary" href={`/analyses/${outcome.analysisId}/compare`}>Open compare</Link>
                  <Link className="btn btn-secondary" href={`/analyses/${outcome.analysisId}/builder`}>Edit assumptions</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recent analyses</h2>
        {analyses.length === 0 ? (
          <div className="alert warn">No analyses yet. Start with a new import to generate your first comparison.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th /></tr></thead>
              <tbody>
                {analyses.slice(0, 5).map((analysis) => (
                  <tr key={analysis.id}>
                    <td>{analysis.title}</td>
                    <td>{analysis.status ?? 'draft'}</td>
                    <td>{new Date(analysis.updatedAt).toLocaleString('fr-FR')}</td>
                    <td><Link className="btn btn-secondary" href={`/analyses/${analysis.id}/builder`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

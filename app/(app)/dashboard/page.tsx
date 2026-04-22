'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Org = { id: string; name: string; country: string; currency: string };
type Analysis = { id: string; title: string; updatedAt: string };

export default function DashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
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
      setAnalyses(analysesJson.analyses ?? []);
      setLoading(false);
    }
    load().catch((err) => {
      setError(String(err));
      setLoading(false);
    });
  }, [router]);

  if (loading) return <main className="content-wrap"><div className="card">Loading dashboard...</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>Dashboard</h1>
        <p>Track your workspace status and launch new import scenario analyses quickly.</p>
      </header>

      <section className="grid-3" style={{ marginTop: 16 }}>
        <article className="card"><p className="kpi-title">Organization</p><p className="kpi-value" style={{ fontSize: 18 }}>{org?.name}</p><p className="muted">{org?.country} · {org?.currency}</p></article>
        <article className="card"><p className="kpi-title">Plan status</p><p className="kpi-value" style={{ fontSize: 18 }}>Trial</p><span className="badge warn">14 days</span></article>
        <article className="card"><p className="kpi-title">Analyses used</p><p className="kpi-value" style={{ fontSize: 18 }}>{analyses.length} / 5</p></article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Start a new import analysis</h2>
        <p className="muted">Upload a source file, map columns, and compare baseline vs alternative sourcing scenarios.</p>
        <Link href="/imports/new" className="btn btn-primary">New import analysis</Link>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Recent analyses</h2>
        {analyses.length === 0 ? (
          <div className="alert warn">No analyses yet. Start with a new import to generate your first comparison.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Updated</th><th /></tr></thead>
              <tbody>
                {analyses.slice(0, 5).map((analysis) => (
                  <tr key={analysis.id}>
                    <td>{analysis.title}</td>
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

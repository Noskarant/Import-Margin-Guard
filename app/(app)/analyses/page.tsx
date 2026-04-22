'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Analysis = { id: string; title: string; status: string; updatedAt: string };

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses').then((response) => response.json()).then((json) => {
      setAnalyses(json.analyses ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <main className="content-wrap"><div className="card">Loading analyses...</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>Saved analyses</h1>
        <p>Reopen and continue scenario comparisons created by your workspace.</p>
      </header>
      <section className="card" style={{ marginTop: 16 }}>
        {analyses.length === 0 ? (
          <div className="alert warn">No saved analyses yet. Start a new import analysis.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th /></tr></thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td>{analysis.title}</td>
                    <td><span className="badge">{analysis.status}</span></td>
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

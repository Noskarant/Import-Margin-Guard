'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Analysis = { id: string; title: string; status: string; updatedAt: string };

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses')
      .then((response) => response.json())
      .then((json) => {
        setAnalyses(json.analyses ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <main style={{ padding: 32 }}>Loading analyses...</main>;

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 32 }}>
      <h1>Saved analyses</h1>
      {analyses.length === 0 ? (
        <p>No analyses yet. <Link href="/imports/new">Start a new analysis</Link></p>
      ) : (
        <table style={{ width: '100%', background: 'white' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Title</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr key={analysis.id}>
                <td>{analysis.title}</td>
                <td>{analysis.status}</td>
                <td>{new Date(analysis.updatedAt).toLocaleString('fr-FR')}</td>
                <td><Link href={`/analyses/${analysis.id}/builder`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

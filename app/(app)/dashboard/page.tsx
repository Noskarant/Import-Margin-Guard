'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Org = { id: string; name: string; country: string; currency: string };

export default function DashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
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
      setAnalysisCount((analysesJson.analyses ?? []).length);
      setLoading(false);
    }
    load().catch((err) => {
      setError(String(err));
      setLoading(false);
    });
  }, [router]);

  async function signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/sign-in');
  }

  if (loading) return <main style={{ padding: 32 }}>Loading dashboard...</main>;
  if (error) return <main style={{ padding: 32, color: 'crimson' }}>{error}</main>;

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Organization: <strong>{org?.name}</strong> ({org?.country}/{org?.currency})</p>
      <p>Trial: 14 days · Analyses used: {analysisCount}/5</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/imports/new">Create first analysis</Link>
        <Link href="/analyses">Saved analyses</Link>
        <button type="button" onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('FR');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch('/api/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, country, currency }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? 'Failed to create organization');
    router.push('/dashboard');
  }

  return (
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>Create your workspace</h1>
      <p className="muted">France-first setup for import scenario analysis and landed-cost decisions.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>Organization name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Imports" required /></label>
        <label>Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="FR">France</option><option value="US">United States</option></select></label>
        <label>Default currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option></select></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating workspace...' : 'Create workspace'}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
    </main>
  );
}

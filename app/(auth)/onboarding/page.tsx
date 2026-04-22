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
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>
      <h1>Create organization</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Organization name" required />
        <select value={country} onChange={(event) => setCountry(event.target.value)}>
          <option value="FR">France</option>
          <option value="US">United States</option>
        </select>
        <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create organization'}</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </main>
  );
}

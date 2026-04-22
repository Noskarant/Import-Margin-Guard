'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? 'Sign in failed');

    const orgResponse = await fetch('/api/org');
    const orgJson = await orgResponse.json();
    router.push(orgJson.organization ? '/dashboard' : '/onboarding');
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required placeholder="Password" />
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </main>
  );
}

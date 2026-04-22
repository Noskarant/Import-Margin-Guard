'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>Sign in</h1>
      <p className="muted">Access your sourcing analyses and scenario comparisons.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required placeholder="Password" /></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
      <p className="muted" style={{ marginBottom: 0 }}>Need an account? <Link href="/sign-up">Create one</Link></p>
    </main>
  );
}

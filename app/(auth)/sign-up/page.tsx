'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? 'Failed to create account');
    router.push('/onboarding');
  }

  return (
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>Create your account</h1>
      <p className="muted">Set up your Import Margin Guard workspace in a few minutes.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} placeholder="Minimum 8 characters" /></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
      <p className="muted" style={{ marginBottom: 0 }}>Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </main>
  );
}

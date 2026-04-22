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
    if (!response.ok) {
      setError(json.error ?? 'Failed to sign up');
      return;
    }
    router.push('/onboarding');
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>
      <h1>Create account</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} placeholder="Minimum 8 characters" />
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <p>Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </main>
  );
}

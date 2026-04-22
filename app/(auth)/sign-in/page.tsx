'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    title: 'Sign in',
    subtitle: 'Access your sourcing analyses and scenario comparisons.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    failed: 'Sign in failed',
    passwordPlaceholder: 'Password',
    needAccount: 'Need an account?',
    createOne: 'Create one',
  },
  fr: {
    title: 'Se connecter',
    subtitle: 'Accédez à vos analyses de sourcing et à vos comparaisons de scénarios.',
    email: 'Email',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion...',
    failed: 'Échec de la connexion',
    passwordPlaceholder: 'Mot de passe',
    needAccount: 'Besoin d’un compte ?',
    createOne: 'En créer un',
  },
} as const;

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    setLang(storedLang === 'fr' ? 'fr' : 'en');

    function onLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<Lang>;
      setLang(customEvent.detail === 'fr' ? 'fr' : 'en');
    }

    window.addEventListener('img-language-change', onLanguageChange as EventListener);
    return () => window.removeEventListener('img-language-change', onLanguageChange as EventListener);
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

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
    if (!response.ok) return setError(json.error ?? t.failed);

    const orgResponse = await fetch('/api/org');
    const orgJson = await orgResponse.json();
    router.push(orgJson.organization ? '/dashboard' : '/onboarding');
  }

  return (
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <p className="muted">{t.subtitle}</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>{t.email}<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" /></label>
        <label>{t.password}<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required placeholder={t.passwordPlaceholder} /></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t.signingIn : t.signIn}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
      <p className="muted" style={{ marginBottom: 0 }}>{t.needAccount} <Link href="/sign-up">{t.createOne}</Link></p>
    </main>
  );
}

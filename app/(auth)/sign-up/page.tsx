'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    title: 'Create your account',
    subtitle: 'Set up your Import Margin Guard workspace in a few minutes.',
    email: 'Email',
    password: 'Password',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    failed: 'Failed to create account',
    minChars: 'Minimum 8 characters',
    alreadyAccount: 'Already have an account?',
    signIn: 'Sign in',
  },
  fr: {
    title: 'Créer votre compte',
    subtitle: 'Configurez votre espace Import Margin Guard en quelques minutes.',
    email: 'Email',
    password: 'Mot de passe',
    createAccount: 'Créer le compte',
    creatingAccount: 'Création du compte...',
    failed: 'Échec de la création du compte',
    minChars: '8 caractères minimum',
    alreadyAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
  },
} as const;

export default function SignUpPage() {
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
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? t.failed);
    router.push('/onboarding');
  }

  return (
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <p className="muted">{t.subtitle}</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>{t.email}<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@company.com" /></label>
        <label>{t.password}<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} placeholder={t.minChars} /></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t.creatingAccount : t.createAccount}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
      <p className="muted" style={{ marginBottom: 0 }}>{t.alreadyAccount} <Link href="/sign-in">{t.signIn}</Link></p>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    title: 'Create your workspace',
    subtitle: 'France-first setup for import scenario analysis and landed-cost decisions.',
    organizationName: 'Organization name',
    country: 'Country',
    defaultCurrency: 'Default currency',
    france: 'France',
    unitedStates: 'United States',
    creating: 'Creating workspace...',
    create: 'Create workspace',
    failed: 'Failed to create organization',
    placeholder: 'Acme Imports',
  },
  fr: {
    title: 'Créer votre espace',
    subtitle: 'Configuration France-first pour l’analyse de scénarios d’import et les décisions liées au landed cost.',
    organizationName: 'Nom de l’organisation',
    country: 'Pays',
    defaultCurrency: 'Devise par défaut',
    france: 'France',
    unitedStates: 'États-Unis',
    creating: 'Création de l’espace...',
    create: 'Créer l’espace',
    failed: 'Échec de la création de l’organisation',
    placeholder: 'Acme Imports',
  },
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('FR');
  const [currency, setCurrency] = useState('EUR');
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
    const response = await fetch('/api/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, country, currency }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? t.failed);
    router.push('/dashboard');
  }

  return (
    <main className="auth-card">
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <p className="muted">{t.subtitle}</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <label>{t.organizationName}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={t.placeholder} required /></label>
        <label>{t.country}<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="FR">{t.france}</option><option value="US">{t.unitedStates}</option></select></label>
        <label>{t.defaultCurrency}<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option></select></label>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t.creating : t.create}</button>
      </form>
      {error ? <p className="alert error" style={{ marginTop: 12 }}>{error}</p> : null}
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    subtitle: 'Compare import scenarios, estimate landed cost, and support sourcing decisions with a clearer view of margin impact.',
    bullet1: 'Upload CSV files with France-first parsing defaults.',
    bullet2: 'Map source columns and validate required fields before importing rows.',
    bullet3: 'Compare baseline and alternative scenarios in one practical decision view.',
    startTrial: 'Start free trial',
    signIn: 'Sign in',
  },
  fr: {
    subtitle: 'Comparez vos scénarios d’import, estimez le landed cost et appuyez vos décisions de sourcing avec une vision plus claire de l’impact marge.',
    bullet1: 'Importez des fichiers CSV avec des réglages France-first.',
    bullet2: 'Mappez les colonnes source et validez les champs requis avant l’import des lignes.',
    bullet3: 'Comparez baseline et scénarios alternatifs dans une vue de décision simple et exploitable.',
    startTrial: 'Démarrer l’essai gratuit',
    signIn: 'Se connecter',
  },
} as const;

export default function LandingPage() {
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

  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <h1 style={{ marginTop: 0 }}>Import Margin Guard</h1>
        <p className="muted">{t.subtitle}</p>
        <div className="card" style={{ marginTop: 16 }}>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            <li>{t.bullet1}</li>
            <li>{t.bullet2}</li>
            <li>{t.bullet3}</li>
          </ul>
        </div>
        <div className="actions">
          <Link className="btn btn-primary" href="/sign-up">{t.startTrial}</Link>
          <Link className="btn btn-secondary" href="/sign-in">{t.signIn}</Link>
        </div>
      </section>
    </main>
  );
}

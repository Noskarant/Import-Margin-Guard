'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Analysis = { id: string; title: string; status: string; updatedAt: string };
type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    loading: 'Loading analyses...',
    title: 'Saved analyses',
    subtitle: 'Reopen previous sourcing comparisons and continue refining assumptions.',
    empty: 'No saved analyses yet. Start a new import analysis to build your first comparison.',
    titleLabel: 'Title',
    status: 'Status',
    updated: 'Updated',
    open: 'Open',
    draft: 'Draft',
    saved: 'Saved',
  },
  fr: {
    loading: 'Chargement des analyses...',
    title: 'Analyses sauvegardées',
    subtitle: 'Rouvrez vos comparaisons de sourcing précédentes et continuez à affiner les hypothèses.',
    empty: 'Aucune analyse sauvegardée pour le moment. Lance une nouvelle analyse d’import pour créer ta première comparaison.',
    titleLabel: 'Titre',
    status: 'Statut',
    updated: 'Mis à jour',
    open: 'Ouvrir',
    draft: 'Brouillon',
    saved: 'Enregistrée',
  },
} as const;

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetch('/api/analyses').then((response) => response.json()).then((json) => {
      setAnalyses(json.analyses ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <main className="content-wrap"><div className="card">{t.loading}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>
      <section className="card" style={{ marginTop: 16 }}>
        {analyses.length === 0 ? (
          <div className="alert warn">{t.empty}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t.titleLabel}</th><th>{t.status}</th><th>{t.updated}</th><th /></tr></thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td>{analysis.title}</td>
                    <td><span className="badge">{analysis.status === 'saved' ? t.saved : t.draft}</span></td>
                    <td>{new Date(analysis.updatedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</td>
                    <td><Link className="btn btn-secondary" href={`/analyses/${analysis.id}/builder`}>{t.open}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

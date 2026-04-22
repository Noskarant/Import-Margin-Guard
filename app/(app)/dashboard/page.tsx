'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Org = { id: string; name: string; country: string; currency: string };
type Analysis = { id: string; title: string; updatedAt: string; status?: string };
type ComparisonResult = {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  notes?: string;
  summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number };
};

type RecentOutcome = {
  analysisId: string;
  title: string;
  updatedAt: string;
  bestScenarioName: string;
  savings: number;
  savingsPct: number;
  marginPct?: number;
};

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    loading: 'Loading dashboard...',
    title: 'Dashboard',
    subtitle: 'Track your workspace status and launch new import scenario analyses quickly.',
    organization: 'Organization',
    planStatus: 'Plan status',
    trial: 'Trial',
    analysesUsed: 'Analyses used',
    recentSavings: 'Recent estimated savings',
    startAnalysis: 'Start a new import analysis',
    startAnalysisText: 'Upload a source file, map columns, and compare baseline vs alternative sourcing scenarios.',
    newImportAnalysis: 'New import analysis',
    recentComparisonOutcomes: 'Recent comparison outcomes',
    noCompletedComparison: 'No completed comparison result yet. Run a comparison to surface the best scenario and estimated savings here.',
    recommendedScenario: 'Recommended scenario',
    estimatedSavings: 'Estimated savings',
    estimatedMargin: 'Estimated margin',
    updated: 'Updated',
    openCompare: 'Open compare',
    editAssumptions: 'Edit assumptions',
    recentAnalyses: 'Recent analyses',
    noAnalyses: 'No analyses yet. Start with a new import to generate your first comparison.',
    titleLabel: 'Title',
    status: 'Status',
    open: 'Open',
    draft: 'draft',
    na: 'N/A',
  },
  fr: {
    loading: 'Chargement du tableau de bord...',
    title: 'Tableau de bord',
    subtitle: 'Suis l’état de ton espace et lance rapidement de nouvelles analyses d’import.',
    organization: 'Organisation',
    planStatus: 'Statut du plan',
    trial: 'Essai',
    analysesUsed: 'Analyses utilisées',
    recentSavings: 'Économies estimées récentes',
    startAnalysis: 'Démarrer une nouvelle analyse d’import',
    startAnalysisText: 'Importe un fichier source, mappe les colonnes et compare la baseline avec des scénarios alternatifs.',
    newImportAnalysis: 'Nouvelle analyse d’import',
    recentComparisonOutcomes: 'Résultats récents des comparaisons',
    noCompletedComparison: 'Aucun résultat de comparaison complet pour le moment. Lance une comparaison pour faire remonter ici le meilleur scénario et les économies estimées.',
    recommendedScenario: 'Scénario recommandé',
    estimatedSavings: 'Économies estimées',
    estimatedMargin: 'Marge estimée',
    updated: 'Mis à jour',
    openCompare: 'Ouvrir la comparaison',
    editAssumptions: 'Modifier les hypothèses',
    recentAnalyses: 'Analyses récentes',
    noAnalyses: 'Aucune analyse pour le moment. Commence par un nouvel import pour générer ta première comparaison.',
    titleLabel: 'Titre',
    status: 'Statut',
    open: 'Ouvrir',
    draft: 'brouillon',
    na: 'N/A',
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [recentOutcomes, setRecentOutcomes] = useState<RecentOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    async function load() {
      const orgResponse = await fetch('/api/org');
      if (orgResponse.status === 401) return router.push('/sign-in');
      const orgJson = await orgResponse.json();
      if (!orgJson.organization) return router.push('/onboarding');
      setOrg(orgJson.organization);

      const analysesResponse = await fetch('/api/analyses');
      const analysesJson = await analysesResponse.json();
      const recentAnalyses: Analysis[] = analysesJson.analyses ?? [];
      setAnalyses(recentAnalyses);

      const outcomes = await Promise.all(
        recentAnalyses.slice(0, 3).map(async (analysis) => {
          try {
            const response = await fetch(`/api/analyses/${analysis.id}/calculate`);
            const json = await response.json();
            if (!response.ok || json.error) return null;

            const results: ComparisonResult[] = json.results ?? [];
            if (results.length < 2) return null;

            const sorted = [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted);
            const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
            const best = sorted[0];
            if (!baseline || !best) return null;

            const savings = baseline.summary.landedTotal - best.summary.landedTotal;
            const savingsPct = baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;

            return {
              analysisId: analysis.id,
              title: analysis.title,
              updatedAt: analysis.updatedAt,
              bestScenarioName: best.scenarioName,
              savings,
              savingsPct,
              marginPct: best.summary.marginPct,
            } satisfies RecentOutcome;
          } catch {
            return null;
          }
        }),
      );

      setRecentOutcomes(outcomes.filter((item): item is RecentOutcome => item !== null));
      setLoading(false);
    }

    load().catch((err) => {
      setError(String(err));
      setLoading(false);
    });
  }, [router]);

  const totalSavings = recentOutcomes.reduce((acc, item) => acc + Math.max(item.savings, 0), 0);

  if (loading) return <main className="content-wrap"><div className="card">{t.loading}</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className="grid-3" style={{ marginTop: 16 }}>
        <article className="card">
          <p className="kpi-title">{t.organization}</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>{org?.name}</p>
          <p className="muted">{org?.country} · {org?.currency}</p>
        </article>
        <article className="card">
          <p className="kpi-title">{t.planStatus}</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>{t.trial}</p>
          <span className="badge warn">14 days</span>
        </article>
        <article className="card">
          <p className="kpi-title">{t.analysesUsed}</p>
          <p className="kpi-value" style={{ fontSize: 18 }}>{analyses.length} / 5</p>
          <p className="muted">{t.recentSavings}: €{totalSavings.toFixed(2)}</p>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.startAnalysis}</h2>
        <p className="muted">{t.startAnalysisText}</p>
        <Link href="/imports/new" className="btn btn-primary">{t.newImportAnalysis}</Link>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.recentComparisonOutcomes}</h2>
        {recentOutcomes.length === 0 ? (
          <div className="alert warn">{t.noCompletedComparison}</div>
        ) : (
          <div className="insight-grid">
            {recentOutcomes.map((outcome) => (
              <article key={outcome.analysisId} className="insight-card">
                <h3>{outcome.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{t.recommendedScenario}: <strong>{outcome.bestScenarioName}</strong></p>
                <div className="insight-meta">
                  <span>{t.estimatedSavings}: €{outcome.savings.toFixed(2)} ({outcome.savingsPct.toFixed(1)}%)</span>
                  <span>{t.estimatedMargin}: {typeof outcome.marginPct === 'number' ? `${(outcome.marginPct * 100).toFixed(1)}%` : t.na}</span>
                  <span>{t.updated}: {new Date(outcome.updatedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
                <div className="actions">
                  <Link className="btn btn-secondary" href={`/analyses/${outcome.analysisId}/compare`}>{t.openCompare}</Link>
                  <Link className="btn btn-secondary" href={`/analyses/${outcome.analysisId}/builder`}>{t.editAssumptions}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.recentAnalyses}</h2>
        {analyses.length === 0 ? (
          <div className="alert warn">{t.noAnalyses}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t.titleLabel}</th><th>{t.status}</th><th>{t.updated}</th><th /></tr></thead>
              <tbody>
                {analyses.slice(0, 5).map((analysis) => (
                  <tr key={analysis.id}>
                    <td>{analysis.title}</td>
                    <td>{analysis.status ?? t.draft}</td>
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

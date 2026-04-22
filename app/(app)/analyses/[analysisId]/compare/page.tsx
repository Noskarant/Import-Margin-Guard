'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';

type Result = {
  scenarioId: string;
  scenarioName: string;
  isBaseline: boolean;
  notes?: string;
  summary: { landedTotal: number; landedUnitWeighted: number; marginPct?: number };
};

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    loading: 'Calculating scenarios...',
    needTwo: 'At least 2 scenarios are required for comparison.',
    title: 'Scenario comparison',
    subtitle: 'Review estimated landed-cost outcomes side by side before making sourcing decisions.',
    bestScenario: 'Best Scenario (Estimated Landed Cost / Unit)',
    lowerBetter: 'Lower is better',
    savingsVsBaseline: 'Savings vs Baseline',
    estimateVsBaseline: 'Estimate vs baseline assumptions',
    grossMarginImpact: 'Estimated Gross Margin Impact',
    shownWhenPricesProvided: 'Shown when sales prices are provided',
    whatToRetain: 'What to retain',
    recommendedScenario: 'Recommended scenario',
    operationalRationale: 'Operational rationale',
    noScenarioNote: 'No scenario note has been added yet. Use builder notes to explain the business intent behind each option.',
    automaticChecks: 'Automatic checks',
    noCriticalIssue: 'No critical issue detected.',
    noCriticalIssueText: 'The current best scenario looks directionally stronger than the baseline.',
    comparisonTable: 'Comparison table',
    scenario: 'Scenario',
    totalLandedCost: 'Total Landed Cost',
    landedCostPerUnit: 'Landed Cost / Unit',
    deltaVsBaseline: 'Delta vs Baseline',
    estimatedGrossMarginPct: 'Estimated Gross Margin %',
    confidence: 'Confidence',
    baseline: 'Baseline',
    recommendationNote: 'Recommendation note',
    backToBuilder: 'Back to builder',
    exportPdf: 'Export PDF',
    generatingPdf: 'Generating PDF...',
    marginNotAvailable: 'Not available',
    na: 'N/A',
    high: 'High',
    medium: 'Medium',
    noSavingsTitle: 'No savings detected',
    noSavingsText: 'The current best scenario does not reduce total landed cost versus the baseline. Check assumptions before using it as a recommendation.',
    savingsDetectedTitle: 'Savings detected',
    savingsDetectedText: 'The selected best scenario saves an estimated {{amount}} versus the baseline.',
    marginMissingTitle: 'Margin not available',
    marginMissingText: 'Sales prices are missing on some or all rows, so gross margin cannot be fully evaluated.',
    lowMarginTitle: 'Low estimated margin',
    lowMarginText: 'Estimated gross margin is {{margin}}%, which may be too low depending on your target margin threshold.',
    costIncreaseTitle: 'Cost increase is material',
    costIncreaseText: 'The best currently selected option still increases landed cost per unit materially versus the baseline. Review purchase, transport, and duty assumptions.',
    landedLowerText: 'Estimated landed cost per unit is {{pct}}% lower than the baseline.',
    marginChangeText: 'Estimated gross margin changes by {{pts}} pts versus the baseline.',
    recommendationText: 'Based on the assumptions entered on 22 April 2026, {{scenario}} shows the lowest estimated landed cost per unit. Estimated savings vs baseline: €{{savings}} ({{pct}}%).{{marginSentence}}',
    marginSentence: ' Estimated gross margin vs baseline: {{pts}} pts.',
  },
  fr: {
    loading: 'Calcul des scénarios...',
    needTwo: 'Au moins 2 scénarios sont requis pour la comparaison.',
    title: 'Comparaison des scénarios',
    subtitle: 'Comparez les résultats estimés de landed cost avant de prendre une décision de sourcing.',
    bestScenario: 'Meilleur scénario (landed cost estimé / unité)',
    lowerBetter: 'Plus bas = mieux',
    savingsVsBaseline: 'Économies vs baseline',
    estimateVsBaseline: 'Estimation vs hypothèses baseline',
    grossMarginImpact: 'Impact estimé sur la marge brute',
    shownWhenPricesProvided: 'Affiché quand les prix de vente sont renseignés',
    whatToRetain: 'À retenir',
    recommendedScenario: 'Scénario recommandé',
    operationalRationale: 'Raisons opérationnelles',
    noScenarioNote: 'Aucune note de scénario n’a encore été ajoutée. Utilise les notes du builder pour expliquer l’intention métier de chaque option.',
    automaticChecks: 'Contrôles automatiques',
    noCriticalIssue: 'Aucun point critique détecté.',
    noCriticalIssueText: 'Le meilleur scénario actuel semble globalement plus fort que la baseline.',
    comparisonTable: 'Tableau de comparaison',
    scenario: 'Scénario',
    totalLandedCost: 'Landed cost total',
    landedCostPerUnit: 'Landed cost / unité',
    deltaVsBaseline: 'Écart vs baseline',
    estimatedGrossMarginPct: 'Marge brute estimée %',
    confidence: 'Confiance',
    baseline: 'Baseline',
    recommendationNote: 'Note de recommandation',
    backToBuilder: 'Retour au builder',
    exportPdf: 'Exporter le PDF',
    generatingPdf: 'Génération du PDF...',
    marginNotAvailable: 'Non disponible',
    na: 'N/A',
    high: 'Élevée',
    medium: 'Moyenne',
    noSavingsTitle: 'Aucune économie détectée',
    noSavingsText: 'Le meilleur scénario actuel ne réduit pas le landed cost total par rapport à la baseline. Vérifie les hypothèses avant de l’utiliser comme recommandation.',
    savingsDetectedTitle: 'Économies détectées',
    savingsDetectedText: 'Le scénario retenu permet une économie estimée de {{amount}} par rapport à la baseline.',
    marginMissingTitle: 'Marge non disponible',
    marginMissingText: 'Les prix de vente sont absents sur une partie ou sur l’ensemble des lignes, donc la marge brute ne peut pas être évaluée complètement.',
    lowMarginTitle: 'Marge estimée faible',
    lowMarginText: 'La marge brute estimée est de {{margin}}%, ce qui peut être trop faible selon ton seuil cible.',
    costIncreaseTitle: 'Hausse de coût significative',
    costIncreaseText: 'La meilleure option actuelle augmente encore sensiblement le landed cost par unité par rapport à la baseline. Revois achat, transport et droits.',
    landedLowerText: 'Le landed cost estimé par unité est inférieur de {{pct}}% à la baseline.',
    marginChangeText: 'La marge brute estimée évolue de {{pts}} pts versus la baseline.',
    recommendationText: 'D’après les hypothèses saisies le 22 avril 2026, {{scenario}} présente le landed cost estimé par unité le plus bas. Économies estimées vs baseline : €{{savings}} ({{pct}}%).{{marginSentence}}',
    marginSentence: ' Évolution estimée de la marge brute vs baseline : {{pts}} pts.',
  },
} as const;

function template(text: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value), text);
}

function confidenceLabel(row: Result, lang: Lang) {
  if (typeof row.summary.marginPct === 'number') return copy[lang].high;
  return copy[lang].medium;
}

export default function ComparePage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
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

  const t = copy[lang];

  useEffect(() => {
    fetch(`/api/analyses/${params.analysisId}/calculate`)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setResults(json.results ?? []);
        setLoading(false);
      });
  }, [params.analysisId]);

  const sorted = useMemo(() => [...results].sort((a, b) => a.summary.landedUnitWeighted - b.summary.landedUnitWeighted), [results]);
  const baseline = results.find((item) => item.isBaseline) ?? sorted[0];
  const best = sorted[0];

  const savings = baseline && best ? baseline.summary.landedTotal - best.summary.landedTotal : 0;
  const savingsPct = baseline && best && baseline.summary.landedTotal > 0 ? (savings / baseline.summary.landedTotal) * 100 : 0;
  const marginImpact = baseline && best && typeof baseline.summary.marginPct === 'number' && typeof best.summary.marginPct === 'number'
    ? (best.summary.marginPct - baseline.summary.marginPct) * 100
    : undefined;

  const executiveReasons = useMemo(() => {
    if (!baseline || !best) return [] as string[];
    const reasons: string[] = [];
    if (best.summary.landedUnitWeighted < baseline.summary.landedUnitWeighted) {
      reasons.push(template(t.landedLowerText, { pct: Math.abs(savingsPct).toFixed(1) }));
    }
    if (typeof marginImpact === 'number') {
      reasons.push(template(t.marginChangeText, { pts: `${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)}` }));
    }
    if (best.notes) reasons.push(best.notes);
    return reasons.slice(0, 3);
  }, [baseline, best, marginImpact, savingsPct, t]);

  const alerts = useMemo(() => {
    if (!baseline || !best) return [] as Array<{ title: string; text: string; tone: 'warn' | 'success' }>;
    const items: Array<{ title: string; text: string; tone: 'warn' | 'success' }> = [];

    if (savings <= 0) {
      items.push({ title: t.noSavingsTitle, text: t.noSavingsText, tone: 'warn' });
    } else {
      items.push({ title: t.savingsDetectedTitle, text: template(t.savingsDetectedText, { amount: `€${savings.toFixed(2)}` }), tone: 'success' });
    }

    if (typeof best.summary.marginPct !== 'number') {
      items.push({ title: t.marginMissingTitle, text: t.marginMissingText, tone: 'warn' });
    } else if (best.summary.marginPct < 0.2) {
      items.push({ title: t.lowMarginTitle, text: template(t.lowMarginText, { margin: (best.summary.marginPct * 100).toFixed(1) }), tone: 'warn' });
    }

    if (best.summary.landedUnitWeighted > baseline.summary.landedUnitWeighted * 1.15) {
      items.push({ title: t.costIncreaseTitle, text: t.costIncreaseText, tone: 'warn' });
    }

    return items;
  }, [baseline, best, savings, t]);

  async function exportPdf() {
    try {
      setExportError(null);
      setExporting(true);
      const response = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: params.analysisId }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? 'PDF generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `import-margin-guard-${params.analysisId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <main className="content-wrap"><div className="card">{t.loading}</div></main>;
  if (error) return <main className="content-wrap"><div className="alert error">{error}</div></main>;
  if (results.length < 2 || !baseline || !best) return <main className="content-wrap"><div className="alert warn">{t.needTwo}</div></main>;

  const recommendation = template(t.recommendationText, {
    scenario: best.scenarioName,
    savings: savings.toFixed(2),
    pct: savingsPct.toFixed(1),
    marginSentence: typeof marginImpact === 'number' ? template(t.marginSentence, { pts: `${marginImpact >= 0 ? '+' : ''}${marginImpact.toFixed(1)}` }) : '',
  });

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className="grid-3" style={{ marginTop: 16 }}>
        <KpiCard title={t.bestScenario} value={`${best.scenarioName} · €${best.summary.landedUnitWeighted.toFixed(2)} / unit`} note={t.lowerBetter} />
        <KpiCard title={t.savingsVsBaseline} value={`€${savings.toFixed(2)} (${savingsPct.toFixed(1)}%)`} note={t.estimateVsBaseline} />
        <KpiCard title={t.grossMarginImpact} value={typeof best.summary.marginPct === 'number' ? `${(best.summary.marginPct * 100).toFixed(1)}%` : t.marginNotAvailable} note={t.shownWhenPricesProvided} />
      </section>

      <section className="grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h2 style={{ marginTop: 0 }}>{t.whatToRetain}</h2>
          <div className="stack-sm">
            <div>
              <p className="kpi-title">{t.recommendedScenario}</p>
              <p className="kpi-value" style={{ fontSize: 20 }}>{best.scenarioName}</p>
            </div>
            <div>
              <p className="kpi-title">{t.operationalRationale}</p>
              <div className="highlight-list">
                {executiveReasons.length > 0 ? executiveReasons.map((reason, index) => (
                  <div className="highlight-item" key={index}>{reason}</div>
                )) : <div className="highlight-item">{t.noScenarioNote}</div>}
              </div>
            </div>
          </div>
        </article>

        <article className="card">
          <h2 style={{ marginTop: 0 }}>{t.automaticChecks}</h2>
          <div className="highlight-list">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={index} className={`alert ${alert.tone === 'warn' ? 'warn' : 'success'}`}>
                <strong>{alert.title}</strong>
                <div>{alert.text}</div>
              </div>
            )) : <div className="alert success"><strong>{t.noCriticalIssue}</strong><div>{t.noCriticalIssueText}</div></div>}
          </div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.comparisonTable}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.scenario}</th>
                <th className="td-num">{t.totalLandedCost}</th>
                <th className="td-num">{t.landedCostPerUnit}</th>
                <th className="td-num">{t.deltaVsBaseline}</th>
                <th className="td-num">{t.estimatedGrossMarginPct}</th>
                <th>{t.confidence}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const delta = row.summary.landedTotal - baseline.summary.landedTotal;
                const isBest = row.scenarioId === best.scenarioId;
                const isBase = row.scenarioId === baseline.scenarioId;
                return (
                  <tr key={row.scenarioId} className={isBest ? 'row-highlight-best' : isBase ? 'row-highlight-base' : undefined}>
                    <td>
                      {row.scenarioName} {isBase ? <span className="badge">{t.baseline}</span> : null}
                      {row.notes ? <div className="muted" style={{ marginTop: 4 }}>{row.notes}</div> : null}
                    </td>
                    <td className="td-num">€{row.summary.landedTotal.toFixed(2)}</td>
                    <td className="td-num">€{row.summary.landedUnitWeighted.toFixed(2)} </td>
                    <td className="td-num">{delta >= 0 ? '+' : ''}€{delta.toFixed(2)}</td>
                    <td className="td-num">{typeof row.summary.marginPct === 'number' ? `${(row.summary.marginPct * 100).toFixed(1)}%` : <span className="muted">{t.na}</span>}</td>
                    <td><span className={`badge ${typeof row.summary.marginPct === 'number' ? 'success' : 'warn'}`}>{confidenceLabel(row, lang)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.recommendationNote}</h2>
        <p style={{ marginBottom: 0 }}>{recommendation}</p>
      </section>

      {exportError ? <div className="alert error" style={{ marginTop: 16 }}>{exportError}</div> : null}
      <div className="actions">
        <button className="btn btn-primary" onClick={exportPdf} disabled={exporting}>{exporting ? t.generatingPdf : t.exportPdf}</button>
        <button className="btn btn-secondary" onClick={() => router.push(`/analyses/${params.analysisId}/builder`)}>{t.backToBuilder}</button>
      </div>
    </main>
  );
}

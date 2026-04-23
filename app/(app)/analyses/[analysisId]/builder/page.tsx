'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Scenario = {
  id: string;
  name: string;
  isBaseline: boolean;
  notes?: string;
  purchasePriceMultiplier: number;
  transportMultiplier: number;
  ancillaryMultiplier: number;
  dutyRateOverride?: number;
};

type AnalysisPayload = {
  analysis: { id: string; title: string; status: string; scenarios: Scenario[] };
  importRecord: { mappedRows: Array<{ sku: string }> };
};

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    loading: 'Loading analysis builder...',
    notFound: 'Analysis not found',
    title: 'Analysis builder',
    subtitle: 'Edit baseline and alternative assumptions, then compare landed cost estimates.',
    details: 'Analysis details',
    analysisTitle: 'Analysis title',
    importedRows: 'Imported rows',
    minScenarios: 'At least 2 scenarios are required to run comparison.',
    baseline: 'Baseline',
    scenario: 'Scenario',
    name: 'Name',
    dutyOverride: 'Duty override (optional)',
    purchaseMultiplier: 'Purchase multiplier',
    transportMultiplier: 'Transport multiplier',
    ancillaryMultiplier: 'Ancillary multiplier',
    scenarioNotes: 'Scenario notes (optional)',
    scenarioNotesPlaceholder: 'Example: Supplier in Turkey, faster lead time, slightly higher transport cost.',
    saveScenario: 'Save scenario',
    savingScenario: 'Saving scenario...',
    scenarioSaved: 'Scenario saved.',
    addScenario: 'Add scenario',
    saveAnalysis: 'Save analysis',
    savingAnalysis: 'Saving analysis...',
    analysisSaved: 'Analysis saved.',
    compareScenarios: 'Compare scenarios',
    unableAdd: 'Unable to add scenario',
    unableSave: 'Unable to save scenario',
    saveFailed: 'Save failed',
  },
  fr: {
    loading: 'Chargement du builder...',
    notFound: 'Analyse introuvable',
    title: 'Builder d’analyse',
    subtitle: 'Modifiez les hypothèses baseline et alternatives, puis comparez les estimations de landed cost.',
    details: 'Détails de l’analyse',
    analysisTitle: 'Titre de l’analyse',
    importedRows: 'Lignes importées',
    minScenarios: 'Au moins 2 scénarios sont requis pour lancer la comparaison.',
    baseline: 'Baseline',
    scenario: 'Scénario',
    name: 'Nom',
    dutyOverride: 'Override des droits (optionnel)',
    purchaseMultiplier: 'Multiplicateur achat',
    transportMultiplier: 'Multiplicateur transport',
    ancillaryMultiplier: 'Multiplicateur frais annexes',
    scenarioNotes: 'Notes du scénario (optionnel)',
    scenarioNotesPlaceholder: 'Exemple : fournisseur en Turquie, lead time plus rapide, coût transport un peu plus élevé.',
    saveScenario: 'Enregistrer le scénario',
    savingScenario: 'Enregistrement du scénario...',
    scenarioSaved: 'Scénario enregistré.',
    addScenario: 'Ajouter un scénario',
    saveAnalysis: 'Enregistrer l’analyse',
    savingAnalysis: 'Enregistrement de l’analyse...',
    analysisSaved: 'Analyse enregistrée.',
    compareScenarios: 'Comparer les scénarios',
    unableAdd: 'Impossible d’ajouter le scénario',
    unableSave: 'Impossible d’enregistrer le scénario',
    saveFailed: 'Échec de l’enregistrement',
  },
} as const;

export default function BuilderPage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingScenarioId, setSavingScenarioId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    fetch(`/api/analyses/${params.analysisId}`)
      .then((response) => response.json())
      .then((json) => {
        if (!json.error) {
          setData(json);
          setTitle(json.analysis.title);
        } else {
          setError(json.error);
        }
        setLoading(false);
      });
  }, [params.analysisId]);

  async function addScenario() {
    setSuccessMessage(null);
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Scenario ${String.fromCharCode(65 + (data?.analysis.scenarios.length ?? 1))}` }),
    });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? t.unableAdd);
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
  }

  async function saveScenario(scenario: Scenario) {
    setError(null);
    setSuccessMessage(null);
    setSavingScenarioId(scenario.id);
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    const json = await response.json();
    setSavingScenarioId(null);
    if (!response.ok) return setError(json.error ?? t.unableSave);
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
    setSuccessMessage(t.scenarioSaved);
  }

  async function saveAnalysis() {
    setError(null);
    setSuccessMessage(null);
    setSaving(true);
    const response = await fetch(`/api/analyses/${params.analysisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status: 'saved' }),
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error ?? t.saveFailed);
    setData((current) => (current ? { ...current, analysis: json.analysis } : current));
    setSuccessMessage(t.analysisSaved);
  }

  if (loading) return <main className="content-wrap"><div className="card">{t.loading}</div></main>;
  if (!data) return <main className="content-wrap"><div className="alert error">{error ?? t.notFound}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.details}</h2>
        <div className="grid-2">
          <label>
            {t.analysisTitle}
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div>
            <p className="kpi-title">{t.importedRows}</p>
            <p className="kpi-value" style={{ fontSize: 20 }}>{data.importRecord?.mappedRows.length ?? 0}</p>
          </div>
        </div>
        <p className="muted">{t.minScenarios}</p>
      </section>

      {data.analysis.scenarios.map((scenario) => (
        <section key={scenario.id} className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>{scenario.name}</h3>
            <span className={`badge ${scenario.isBaseline ? 'warn' : ''}`}>{scenario.isBaseline ? t.baseline : t.scenario}</span>
          </div>
          <div className="grid-2">
            <label>
              {t.name}
              <input
                value={scenario.name}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id ? { ...item, name: event.target.value } : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
            <label>
              {t.dutyOverride}
              <input
                type="number"
                step="0.01"
                value={scenario.dutyRateOverride ?? ''}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id
                                ? { ...item, dutyRateOverride: event.target.value === '' ? undefined : Number(event.target.value) }
                                : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
            <label>
              {t.purchaseMultiplier}
              <input
                type="number"
                step="0.01"
                value={scenario.purchasePriceMultiplier}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id ? { ...item, purchasePriceMultiplier: Number(event.target.value) } : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
            <label>
              {t.transportMultiplier}
              <input
                type="number"
                step="0.01"
                value={scenario.transportMultiplier}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id ? { ...item, transportMultiplier: Number(event.target.value) } : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
            <label>
              {t.ancillaryMultiplier}
              <input
                type="number"
                step="0.01"
                value={scenario.ancillaryMultiplier}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id ? { ...item, ancillaryMultiplier: Number(event.target.value) } : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>
              {t.scenarioNotes}
              <textarea
                value={scenario.notes ?? ''}
                placeholder={t.scenarioNotesPlaceholder}
                onChange={(event) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          analysis: {
                            ...current.analysis,
                            scenarios: current.analysis.scenarios.map((item) =>
                              item.id === scenario.id ? { ...item, notes: event.target.value } : item,
                            ),
                          },
                        }
                      : current,
                  )
                }
              />
            </label>
          </div>
          <div className="actions">
            <button className="btn btn-secondary" type="button" onClick={() => saveScenario(scenario)} disabled={savingScenarioId === scenario.id}>
              {savingScenarioId === scenario.id ? t.savingScenario : t.saveScenario}
            </button>
          </div>
        </section>
      ))}

      {successMessage ? <div className="alert success" style={{ marginTop: 16 }}>{successMessage}</div> : null}
      {error ? <div className="alert error" style={{ marginTop: 16 }}>{error}</div> : null}
      <div className="actions" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" type="button" onClick={addScenario}>{t.addScenario}</button>
        <button className="btn btn-primary" type="button" onClick={saveAnalysis} disabled={saving}>{saving ? t.savingAnalysis : t.saveAnalysis}</button>
        <button className="btn btn-primary" type="button" onClick={() => router.push(`/analyses/${params.analysisId}/compare`)} disabled={data.analysis.scenarios.length < 2 || saving || savingScenarioId !== null}>{t.compareScenarios}</button>
      </div>
    </main>
  );
}

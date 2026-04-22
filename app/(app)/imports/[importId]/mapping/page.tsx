'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const REQUIRED_TARGETS = ['sku', 'supplier', 'country', 'unitPurchasePrice', 'quantity', 'currency', 'transportCost', 'dutyRate', 'incoterm', 'ancillaryFees'] as const;
type ImportPayload = { id: string; headers: string[]; previewRows: Record<string, string>[] };
type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const suggestionMap: Record<string, string[]> = {
  sku: ['référence', 'reference', 'sku'], supplier: ['fournisseur', 'supplier'], country: ["pays d'origine", 'country'],
  unitPurchasePrice: ['prix unitaire', 'unit price'], quantity: ['quantité', 'quantity'], currency: ['devise', 'currency'],
  transportCost: ['transport', 'transport cost'], dutyRate: ['droit de douane', 'duty'], incoterm: ['incoterm'],
  ancillaryFees: ['frais annexes', 'ancillary'], salesPrice: ['prix de vente', 'sales price'],
};

const copy = {
  en: {
    loading: 'Loading mapping...',
    importNotFound: 'Import not found.',
    title: 'Column mapping',
    subtitle: 'Match source columns to required fields before validating and importing rows.',
    requiredMissing: 'Required mappings missing',
    allMapped: 'All required fields are mapped.',
    targetField: 'Target field',
    requirement: 'Requirement',
    sourceColumn: 'Source column',
    required: 'Required',
    optional: 'Optional',
    notMapped: '-- not mapped --',
    validating: 'Validating and importing...',
    validateImport: 'Validate and import rows',
    commitFailed: 'Commit failed',
    analysisCreationFailed: 'Analysis creation failed',
  },
  fr: {
    loading: 'Chargement du mapping...',
    importNotFound: 'Import introuvable.',
    title: 'Mapping des colonnes',
    subtitle: 'Associe les colonnes source aux champs requis avant de valider et d’importer les lignes.',
    requiredMissing: 'Mappings requis manquants',
    allMapped: 'Tous les champs requis sont mappés.',
    targetField: 'Champ cible',
    requirement: 'Exigence',
    sourceColumn: 'Colonne source',
    required: 'Requis',
    optional: 'Optionnel',
    notMapped: '-- non mappé --',
    validating: 'Validation et import en cours...',
    validateImport: 'Valider et importer les lignes',
    commitFailed: 'Échec du commit',
    analysisCreationFailed: 'Échec de la création de l’analyse',
  },
} as const;

function suggest(headers: string[], target: string) {
  const labels = suggestionMap[target] ?? [];
  return headers.find((header) => labels.some((label) => header.toLowerCase().includes(label.toLowerCase()))) ?? '';
}

export default function MappingPage() {
  const params = useParams<{ importId: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<ImportPayload | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
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
    fetch(`/api/imports/${params.importId}`).then((response) => response.json()).then((json) => {
      if (json.error) setError(json.error);
      else {
        setRecord(json);
        const defaults = Object.fromEntries([...REQUIRED_TARGETS, 'salesPrice'].map((target) => [target, suggest(json.headers, target)]));
        setMapping(defaults);
      }
      setLoading(false);
    });
  }, [params.importId]);

  const missing = useMemo(() => REQUIRED_TARGETS.filter((target) => !mapping[target]), [mapping]);

  async function onCommit() {
    if (!record) return;
    setCommitting(true);
    setError(null);

    const commitResponse = await fetch('/api/imports/commit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importId: record.id, mapping, previewRows: record.previewRows }),
    });
    const commitJson = await commitResponse.json();
    if (!commitResponse.ok) {
      setCommitting(false);
      return setError(commitJson.error ?? t.commitFailed);
    }

    const analysisResponse = await fetch('/api/analyses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importId: record.id, title: `Analysis ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}` }),
    });
    const analysisJson = await analysisResponse.json();
    setCommitting(false);
    if (!analysisResponse.ok) return setError(analysisJson.error ?? t.analysisCreationFailed);

    router.push(`/analyses/${analysisJson.analysis.id}/builder`);
  }

  if (loading) return <main className="content-wrap"><div className="card">{t.loading}</div></main>;
  if (error && !record) return <main className="content-wrap"><div className="alert error">{error}</div></main>;
  if (!record) return <main className="content-wrap"><div className="alert warn">{t.importNotFound}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head"><h1>{t.title}</h1><p>{t.subtitle}</p></header>
      <section className="card" style={{ marginTop: 16 }}>
        {missing.length > 0 ? <div className="alert warn" style={{ marginBottom: 12 }}>{t.requiredMissing}: {missing.join(', ')}</div> : <div className="alert success" style={{ marginBottom: 12 }}>{t.allMapped}</div>}
        {error ? <div className="alert error" style={{ marginBottom: 12 }}>{error}</div> : null}
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t.targetField}</th><th>{t.requirement}</th><th>{t.sourceColumn}</th></tr></thead>
            <tbody>
              {[...REQUIRED_TARGETS, 'salesPrice'].map((target) => (
                <tr key={target}>
                  <td>{target}</td>
                  <td>{REQUIRED_TARGETS.includes(target as (typeof REQUIRED_TARGETS)[number]) ? <span className="badge warn">{t.required}</span> : <span className="badge">{t.optional}</span>}</td>
                  <td>
                    <select value={mapping[target] ?? ''} onChange={(event) => setMapping((current) => ({ ...current, [target]: event.target.value }))}>
                      <option value="">{t.notMapped}</option>
                      {record.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions"><button className="btn btn-primary" disabled={missing.length > 0 || committing} onClick={onCommit}>{committing ? t.validating : t.validateImport}</button></div>
      </section>
    </main>
  );
}

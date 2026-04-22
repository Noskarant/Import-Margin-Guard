'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Preview = { importId: string; headers: string[]; rows: Record<string, string>[]; delimiter: ';' | ',' };
type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    title: 'Upload import file',
    subtitle: 'Upload your source CSV for preview and mapping. France-first parsing uses semicolon as default delimiter.',
    upload: 'Upload',
    supportedFormats: 'Supported formats: CSV (.csv), XLSX (.xlsx). For this demo flow, CSV is recommended.',
    parsing: 'Parsing file preview...',
    parseFailed: 'Parse failed',
    formatGuidance: 'Format guidance',
    guide1: 'Use French labels where possible (ex: prix unitaire, quantité).',
    guide2: 'French decimal normalization is supported (e.g. 1 250,75).',
    guide3: 'Include incoterm values from EXW, FOB, CIF, DDP, FCA.',
    preview: 'Preview',
    noFile: 'No file parsed yet. Upload a file to review preview rows and continue.',
    delimiter: 'Delimiter',
    semicolon: 'semicolon (;)',
    comma: 'comma (,)',
    continue: 'Continue to mapping',
  },
  fr: {
    title: 'Importer un fichier',
    subtitle: 'Importe ton CSV source pour le prévisualiser et mapper les colonnes. Le parsing France-first utilise le point-virgule par défaut.',
    upload: 'Import',
    supportedFormats: 'Formats supportés : CSV (.csv), XLSX (.xlsx). Pour ce flow de démo, le CSV est recommandé.',
    parsing: 'Analyse de l’aperçu du fichier...',
    parseFailed: 'Échec du parsing',
    formatGuidance: 'Conseils de format',
    guide1: 'Utilise des labels français si possible (ex : prix unitaire, quantité).',
    guide2: 'La normalisation des décimales FR est supportée (ex : 1 250,75).',
    guide3: 'Inclure des incoterms parmi EXW, FOB, CIF, DDP, FCA.',
    preview: 'Aperçu',
    noFile: 'Aucun fichier analysé pour le moment. Importe un fichier pour voir un aperçu et continuer.',
    delimiter: 'Séparateur',
    semicolon: 'point-virgule (;)',
    comma: 'virgule (,)',
    continue: 'Continuer vers le mapping',
  },
} as const;

export default function NewImportPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
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

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);

    const fileText = await file.text();
    const response = await fetch('/api/imports/parse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileText }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? t.parseFailed);
    setPreview(json);
  }

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t.upload}</h2>
          <p className="muted">{t.supportedFormats}</p>
          <input type="file" accept=".csv,.xlsx" onChange={onFileChange} />
          {loading ? <p className="muted">{t.parsing}</p> : null}
          {error ? <p className="alert error">{error}</p> : null}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{t.formatGuidance}</h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            <li>{t.guide1}</li>
            <li>{t.guide2}</li>
            <li>{t.guide3}</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t.preview}</h2>
        {!preview ? (
          <p className="muted">{t.noFile}</p>
        ) : (
          <>
            <div className="badge" style={{ marginBottom: 10 }}>{t.delimiter}: {preview.delimiter === ';' ? t.semicolon : t.comma}</div>
            <div className="table-wrap">
              <table>
                <thead><tr>{preview.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                <tbody>
                  {preview.rows.map((row, index) => (
                    <tr key={index}>{preview.headers.map((header) => <td key={`${index}-${header}`}>{row[header]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions"><button className="btn btn-primary" onClick={() => router.push(`/imports/${preview.importId}/mapping`)}>{t.continue}</button></div>
          </>
        )}
      </section>
    </main>
  );
}

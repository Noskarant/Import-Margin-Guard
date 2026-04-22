'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const REQUIRED_TARGETS = [
  'sku',
  'supplier',
  'country',
  'unitPurchasePrice',
  'quantity',
  'currency',
  'transportCost',
  'dutyRate',
  'incoterm',
  'ancillaryFees',
] as const;

type ImportPayload = { id: string; headers: string[]; previewRows: Record<string, string>[] };

const suggestionMap: Record<string, string[]> = {
  sku: ['référence', 'reference', 'sku'],
  supplier: ['fournisseur', 'supplier'],
  country: ["pays d'origine", 'country'],
  unitPurchasePrice: ['prix unitaire', 'unit price'],
  quantity: ['quantité', 'quantity'],
  currency: ['devise', 'currency'],
  transportCost: ['transport', 'transport cost'],
  dutyRate: ['droit de douane', 'duty'],
  incoterm: ['incoterm'],
  ancillaryFees: ['frais annexes', 'ancillary'],
  salesPrice: ['prix de vente', 'sales price'],
};

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

  useEffect(() => {
    fetch(`/api/imports/${params.importId}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setRecord(json);
          const defaults = Object.fromEntries(
            [...REQUIRED_TARGETS, 'salesPrice'].map((target) => [target, suggest(json.headers, target)])
          );
          setMapping(defaults);
        }
        setLoading(false);
      });
  }, [params.importId]);

  const missing = useMemo(
    () => REQUIRED_TARGETS.filter((target) => !mapping[target]),
    [mapping]
  );

  async function onCommit() {
    if (!record) return;
    setCommitting(true);
    setError(null);

    const commitResponse = await fetch('/api/imports/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importId: record.id, mapping, previewRows: record.previewRows }),
    });
    const commitJson = await commitResponse.json();
    if (!commitResponse.ok) {
      setCommitting(false);
      return setError(commitJson.error ?? 'Commit failed');
    }

    const analysisResponse = await fetch('/api/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importId: record.id, title: `Analysis ${new Date().toLocaleDateString('fr-FR')}` }),
    });
    const analysisJson = await analysisResponse.json();
    setCommitting(false);
    if (!analysisResponse.ok) return setError(analysisJson.error ?? 'Analysis creation failed');

    router.push(`/analyses/${analysisJson.analysis.id}/builder`);
  }

  if (loading) return <main style={{ padding: 32 }}>Loading mapping...</main>;
  if (error && !record) return <main style={{ padding: 32, color: 'crimson' }}>{error}</main>;
  if (!record) return <main style={{ padding: 32 }}>Import not found.</main>;

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 32 }}>
      <h1>Column mapping</h1>
      <p>Map required fields. Missing fields block import commit.</p>
      <table style={{ width: '100%', background: 'white' }}>
        <thead><tr><th style={{ textAlign: 'left' }}>Target field</th><th style={{ textAlign: 'left' }}>Source column</th></tr></thead>
        <tbody>
          {[...REQUIRED_TARGETS, 'salesPrice'].map((target) => (
            <tr key={target}>
              <td>{target}</td>
              <td>
                <select value={mapping[target] ?? ''} onChange={(event) => setMapping((current) => ({ ...current, [target]: event.target.value }))}>
                  <option value="">-- not mapped --</option>
                  {record.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {missing.length > 0 ? <p style={{ color: '#b45309' }}>Required unmapped: {missing.join(', ')}</p> : <p>All required fields mapped.</p>}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <button type="button" disabled={missing.length > 0 || committing} onClick={onCommit}>{committing ? 'Committing...' : 'Validate and import rows'}</button>
    </main>
  );
}

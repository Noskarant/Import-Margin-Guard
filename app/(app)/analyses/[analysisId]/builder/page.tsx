'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Scenario = {
  id: string;
  name: string;
  isBaseline: boolean;
  purchasePriceMultiplier: number;
  transportMultiplier: number;
  ancillaryMultiplier: number;
  dutyRateOverride?: number;
};

type AnalysisPayload = {
  analysis: { id: string; title: string; status: string; scenarios: Scenario[] };
  importRecord: { mappedRows: Array<{ sku: string }> };
};

export default function BuilderPage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadAnalysis() {
    const response = await fetch(`/api/analyses/${params.analysisId}`);
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? 'Failed to load analysis');
    } else {
      setData(json);
      setTitle(json.analysis.title);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAnalysis();
  }, [params.analysisId]);

  async function addScenario() {
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Scenario ${String.fromCharCode(65 + (data?.analysis.scenarios.length ?? 1))}` }),
    });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? 'Unable to add scenario');
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
  }

  async function saveScenario(scenario: Scenario) {
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? 'Unable to save scenario');
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
  }

  async function saveAnalysis() {
    setSaving(true);
    const response = await fetch(`/api/analyses/${params.analysisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status: 'saved' }),
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error ?? 'Save failed');
    setData((current) => (current ? { ...current, analysis: json.analysis } : current));
  }

  if (loading) return <main style={{ padding: 32 }}>Loading analysis builder...</main>;
  if (!data) return <main style={{ padding: 32, color: 'crimson' }}>{error ?? 'Analysis not found'}</main>;

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: 32 }}>
      <h1>Analysis builder</h1>
      <p>Imported rows: {data.importRecord?.mappedRows.length ?? 0}</p>
      <label>
        Analysis title
        <input value={title} onChange={(event) => setTitle(event.target.value)} style={{ marginLeft: 8 }} />
      </label>
      <h2>Scenarios</h2>
      <p>At least 2 scenarios are required for comparison.</p>
      {data.analysis.scenarios.map((scenario) => (
        <section key={scenario.id} style={{ background: 'white', border: '1px solid #e5e7eb', padding: 12, marginBottom: 12 }}>
          <label>Name <input value={scenario.name} onChange={(event) => setData((current) => {
            if (!current) return current;
            return {
              ...current,
              analysis: {
                ...current.analysis,
                scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, name: event.target.value } : item),
              },
            };
          })} /></label>
          <p>{scenario.isBaseline ? 'Baseline scenario' : 'Alternative scenario'}</p>
          <label>Purchase multiplier <input type="number" step="0.01" value={scenario.purchasePriceMultiplier} onChange={(event) => setData((current) => {
            if (!current) return current;
            return {
              ...current,
              analysis: {
                ...current.analysis,
                scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, purchasePriceMultiplier: Number(event.target.value) } : item),
              },
            };
          })} /></label>
          <label>Transport multiplier <input type="number" step="0.01" value={scenario.transportMultiplier} onChange={(event) => setData((current) => {
            if (!current) return current;
            return {
              ...current,
              analysis: {
                ...current.analysis,
                scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, transportMultiplier: Number(event.target.value) } : item),
              },
            };
          })} /></label>
          <label>Ancillary multiplier <input type="number" step="0.01" value={scenario.ancillaryMultiplier} onChange={(event) => setData((current) => {
            if (!current) return current;
            return {
              ...current,
              analysis: {
                ...current.analysis,
                scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, ancillaryMultiplier: Number(event.target.value) } : item),
              },
            };
          })} /></label>
          <label>Duty override (optional) <input type="number" step="0.01" value={scenario.dutyRateOverride ?? ''} onChange={(event) => setData((current) => {
            if (!current) return current;
            return {
              ...current,
              analysis: {
                ...current.analysis,
                scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, dutyRateOverride: event.target.value === '' ? undefined : Number(event.target.value) } : item),
              },
            };
          })} /></label>
          <button type="button" onClick={() => saveScenario(scenario)}>Save scenario</button>
        </section>
      ))}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={addScenario}>Add scenario</button>
        <button type="button" onClick={saveAnalysis} disabled={saving}>{saving ? 'Saving...' : 'Save analysis'}</button>
        <button type="button" onClick={() => router.push(`/analyses/${params.analysisId}/compare`)} disabled={data.analysis.scenarios.length < 2}>Compare scenarios</button>
      </div>
    </main>
  );
}

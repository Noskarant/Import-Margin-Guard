'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Scenario = {
  id: string; name: string; isBaseline: boolean; purchasePriceMultiplier: number; transportMultiplier: number; ancillaryMultiplier: number; dutyRateOverride?: number;
};

type AnalysisPayload = { analysis: { id: string; title: string; status: string; scenarios: Scenario[] }; importRecord: { mappedRows: Array<{ sku: string }> } };

export default function BuilderPage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/analyses/${params.analysisId}`).then((response) => response.json()).then((json) => {
      if (!json.error) { setData(json); setTitle(json.analysis.title); } else setError(json.error);
      setLoading(false);
    });
  }, [params.analysisId]);

  async function addScenario() {
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `Scenario ${String.fromCharCode(65 + (data?.analysis.scenarios.length ?? 1))}` }) });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? 'Unable to add scenario');
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
  }

  async function saveScenario(scenario: Scenario) {
    const response = await fetch(`/api/analyses/${params.analysisId}/scenarios`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scenario) });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? 'Unable to save scenario');
    setData((current) => (current ? { ...current, analysis: { ...current.analysis, scenarios: json.scenarios } } : current));
  }

  async function saveAnalysis() {
    setSaving(true);
    const response = await fetch(`/api/analyses/${params.analysisId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, status: 'saved' }) });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error ?? 'Save failed');
    setData((current) => (current ? { ...current, analysis: json.analysis } : current));
  }

  if (loading) return <main className="content-wrap"><div className="card">Loading analysis builder...</div></main>;
  if (!data) return <main className="content-wrap"><div className="alert error">{error ?? 'Analysis not found'}</div></main>;

  return (
    <main className="content-wrap">
      <header className="page-head"><h1>Analysis builder</h1><p>Edit baseline and alternative assumptions, then compare landed cost estimates.</p></header>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Analysis details</h2>
        <div className="grid-2">
          <label>Analysis title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <div><p className="kpi-title">Imported rows</p><p className="kpi-value" style={{ fontSize: 20 }}>{data.importRecord?.mappedRows.length ?? 0}</p></div>
        </div>
        <p className="muted">At least 2 scenarios are required to run comparison.</p>
      </section>

      {data.analysis.scenarios.map((scenario) => (
        <section key={scenario.id} className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>{scenario.name}</h3>
            <span className={`badge ${scenario.isBaseline ? 'warn' : ''}`}>{scenario.isBaseline ? 'Baseline' : 'Scenario'}</span>
          </div>
          <div className="grid-2">
            <label>Name<input value={scenario.name} onChange={(event) => setData((current) => current ? { ...current, analysis: { ...current.analysis, scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, name: event.target.value } : item) } } : current)} /></label>
            <label>Duty override (optional)<input type="number" step="0.01" value={scenario.dutyRateOverride ?? ''} onChange={(event) => setData((current) => current ? { ...current, analysis: { ...current.analysis, scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, dutyRateOverride: event.target.value === '' ? undefined : Number(event.target.value) } : item) } } : current)} /></label>
            <label>Purchase multiplier<input type="number" step="0.01" value={scenario.purchasePriceMultiplier} onChange={(event) => setData((current) => current ? { ...current, analysis: { ...current.analysis, scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, purchasePriceMultiplier: Number(event.target.value) } : item) } } : current)} /></label>
            <label>Transport multiplier<input type="number" step="0.01" value={scenario.transportMultiplier} onChange={(event) => setData((current) => current ? { ...current, analysis: { ...current.analysis, scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, transportMultiplier: Number(event.target.value) } : item) } } : current)} /></label>
            <label>Ancillary multiplier<input type="number" step="0.01" value={scenario.ancillaryMultiplier} onChange={(event) => setData((current) => current ? { ...current, analysis: { ...current.analysis, scenarios: current.analysis.scenarios.map((item) => item.id === scenario.id ? { ...item, ancillaryMultiplier: Number(event.target.value) } : item) } } : current)} /></label>
          </div>
          <div className="actions"><button className="btn btn-secondary" type="button" onClick={() => saveScenario(scenario)}>Save scenario</button></div>
        </section>
      ))}

      {error ? <div className="alert error" style={{ marginTop: 16 }}>{error}</div> : null}
      <div className="actions" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" type="button" onClick={addScenario}>Add scenario</button>
        <button className="btn btn-primary" type="button" onClick={saveAnalysis} disabled={saving}>{saving ? 'Saving analysis...' : 'Save analysis'}</button>
        <button className="btn btn-primary" type="button" onClick={() => router.push(`/analyses/${params.analysisId}/compare`)} disabled={data.analysis.scenarios.length < 2}>Compare scenarios</button>
      </div>
    </main>
  );
}

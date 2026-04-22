'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Preview = { importId: string; headers: string[]; rows: Record<string, string>[]; delimiter: ';' | ',' };

export default function NewImportPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!response.ok) return setError(json.error ?? 'Parse failed');
    setPreview(json);
  }

  return (
    <main className="content-wrap">
      <header className="page-head">
        <h1>Upload import file</h1>
        <p>Upload your source CSV for preview and mapping. France-first parsing uses semicolon as default delimiter.</p>
      </header>

      <section className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Upload</h2>
          <p className="muted">Supported formats: CSV (.csv), XLSX (.xlsx). For this demo flow, CSV is recommended.</p>
          <input type="file" accept=".csv,.xlsx" onChange={onFileChange} />
          {loading ? <p className="muted">Parsing file preview...</p> : null}
          {error ? <p className="alert error">{error}</p> : null}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Format guidance</h2>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            <li>Use French labels where possible (ex: prix unitaire, quantité).</li>
            <li>French decimal normalization is supported (e.g. 1 250,75).</li>
            <li>Include incoterm values from EXW, FOB, CIF, DDP, FCA.</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Preview</h2>
        {!preview ? (
          <p className="muted">No file parsed yet. Upload a file to review preview rows and continue.</p>
        ) : (
          <>
            <div className="badge" style={{ marginBottom: 10 }}>Delimiter: {preview.delimiter === ';' ? 'semicolon (;)' : 'comma (,)'}</div>
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
            <div className="actions"><button className="btn btn-primary" onClick={() => router.push(`/imports/${preview.importId}/mapping`)}>Continue to mapping</button></div>
          </>
        )}
      </section>
    </main>
  );
}

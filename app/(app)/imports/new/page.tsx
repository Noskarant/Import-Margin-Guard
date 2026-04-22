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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type, fileText }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error ?? 'Parse failed');
    setPreview(json);
  }

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 32 }}>
      <h1>Upload import file</h1>
      <p>Accepted: CSV (semicolon-first for FR). XLSX returns clear guidance in this thin slice.</p>
      <input type="file" accept=".csv,.xlsx" onChange={onFileChange} />
      {loading ? <p>Parsing file preview...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      {preview ? (
        <section>
          <h2>Preview ({preview.delimiter === ';' ? 'semicolon' : 'comma'} delimiter)</h2>
          <table style={{ width: '100%', background: 'white' }}>
            <thead>
              <tr>{preview.headers.map((header) => <th key={header}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {preview.rows.map((row, index) => (
                <tr key={index}>{preview.headers.map((header) => <td key={`${index}-${header}`}>{row[header]}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => router.push(`/imports/${preview.importId}/mapping`)}>Continue to mapping</button>
        </section>
      ) : (
        <p>Upload your first import file to continue.</p>
      )}
    </main>
  );
}

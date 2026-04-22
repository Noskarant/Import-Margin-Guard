import type { ReactNode } from 'react';

export function KpiCard({ title, value, note }: { title: string; value: ReactNode; note?: string }) {
  return (
    <article style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', flex: 1 }}>
      <h3 style={{ marginTop: 0, fontSize: 14 }}>{title}</h3>
      <strong style={{ fontSize: 20 }}>{value}</strong>
      {note ? <p style={{ marginBottom: 0, color: '#6b7280' }}>{note}</p> : null}
    </article>
  );
}

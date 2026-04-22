import type { ReactNode } from 'react';

export function KpiCard({ title, value, note }: { title: string; value: ReactNode; note?: string }) {
  return (
    <article className="card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {note ? <p className="muted" style={{ margin: 0 }}>{note}</p> : null}
    </article>
  );
}

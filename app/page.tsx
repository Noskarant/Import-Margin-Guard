import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <h1 style={{ marginTop: 0 }}>Import Margin Guard</h1>
        <p className="muted">Compare import scenarios, estimate landed cost, and align sourcing decisions with confidence.</p>
        <div className="card" style={{ marginTop: 16 }}>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            <li>Upload CSV files with France-first parsing defaults.</li>
            <li>Map columns and validate required fields before commit.</li>
            <li>Compare baseline vs alternatives in one decision table.</li>
          </ul>
        </div>
        <div className="actions">
          <Link className="btn btn-primary" href="/sign-up">Start free trial</Link>
          <Link className="btn btn-secondary" href="/sign-in">Sign in</Link>
        </div>
      </section>
    </main>
  );
}

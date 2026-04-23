'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <div className="badge success" style={{ marginBottom: 12 }}>Payment received</div>
        <h1 style={{ marginTop: 0 }}>Billing confirmed</h1>
        <p className="muted">
          Your checkout was completed successfully. Your billing status will refresh automatically once Stripe confirms the event.
        </p>
        {sessionId ? <p className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>Session: {sessionId}</p> : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/dashboard">Go to dashboard</Link>
          <Link className="btn btn-secondary" href="/pricing">Back to pricing</Link>
        </div>
      </section>
    </main>
  );
}

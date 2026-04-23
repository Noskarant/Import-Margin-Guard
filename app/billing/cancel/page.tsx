'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BillingCancelPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <div className="badge warn" style={{ marginBottom: 12 }}>Checkout not completed</div>
        <h1 style={{ marginTop: 0 }}>Payment canceled</h1>
        <p className="muted">
          No payment was taken. You can review the pricing page and restart checkout whenever you are ready.
        </p>
        {plan ? <p className="muted" style={{ fontSize: 13 }}>Selected plan: {plan}</p> : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/pricing">Return to pricing</Link>
          <Link className="btn btn-secondary" href="/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function formatPlan(plan: string | null) {
  if (!plan) return null;
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default function BillingCancelPage() {
  const searchParams = useSearchParams();
  const plan = formatPlan(searchParams.get('plan'));

  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 600px)' }}>
        <div className="badge warn" style={{ marginBottom: 12 }}>Checkout paused</div>
        <h1 style={{ marginTop: 0 }}>No payment was taken</h1>
        <p className="muted">
          Your checkout was not completed, so your card was not charged. You can return to pricing, choose a plan again, or go back to your workspace.
        </p>
        {plan ? <div className="alert warn" style={{ marginTop: 12 }}>Selected plan: <strong>{plan}</strong></div> : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/pricing">Choose a plan</Link>
          <Link className="btn btn-secondary" href="/dashboard">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}

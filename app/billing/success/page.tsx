'use client';

import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <main className="auth-shell" style={{ alignContent: 'center' }}>
      <section className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <div className="badge success" style={{ marginBottom: 12 }}>Access activated</div>
        <h1 style={{ marginTop: 0 }}>You're all set</h1>
        <p className="muted">
          Your checkout was completed successfully. Your workspace access will refresh automatically once Stripe confirms the payment.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/dashboard">Go to dashboard</Link>
          <Link className="btn btn-secondary" href="/pricing">Back to pricing</Link>
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 32 }}>
      <h1>Import Margin Guard</h1>
      <p>Compare 2–3 import scenarios and protect margin before purchase decisions.</p>
      <ul>
        <li>Upload CSV (FR semicolon-first)</li>
        <li>Map columns and validate required fields</li>
        <li>Compare landed cost and optional margin</li>
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/sign-up">Start free trial</Link>
        <Link href="/sign-in">Sign in</Link>
      </div>
    </main>
  );
}

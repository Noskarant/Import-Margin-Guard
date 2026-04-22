'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/imports/new', label: 'New Import' },
  { href: '/analyses', label: 'Saved Analyses' },
  { href: '/onboarding', label: 'Organization' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgName, setOrgName] = useState('Workspace');

  useEffect(() => {
    fetch('/api/org')
      .then((res) => res.json())
      .then((json) => {
        if (json.organization?.name) setOrgName(json.organization.name);
      });
  }, []);

  async function signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/sign-in');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Import Margin Guard</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="main-pane">
        <header className="topbar">
          <div className="topbar-meta">
            <strong>{orgName}</strong>
            <span className="badge">MVP Demo</span>
            <span className="badge warn">Trial</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={signOut}>Sign out</button>
        </header>
        {children}
      </div>
    </div>
  );
}

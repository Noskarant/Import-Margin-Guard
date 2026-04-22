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

const THEME_STORAGE_KEY = 'img_theme';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgName, setOrgName] = useState('Workspace');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetch('/api/org')
      .then((res) => res.json())
      .then((json) => {
        if (json.organization?.name) setOrgName(json.organization.name);
      });
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const shouldUseDark = storedTheme === 'dark';
    setIsDarkMode(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? 'dark' : 'light';
  }, []);

  function toggleTheme() {
    setIsDarkMode((current) => {
      const next = !current;
      const nextTheme = next ? 'dark' : 'light';
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      return next;
    });
  }

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
          <div className="topbar-actions">
            <label className="toggle-switch" aria-label="Toggle dark mode">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
              <span>Dark mode</span>
            </label>
            <button type="button" className="btn btn-secondary" onClick={signOut}>Sign out</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

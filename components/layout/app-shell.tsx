'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'img_theme';
const LANG_STORAGE_KEY = 'img_lang';

const navItems = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/imports/new', key: 'newImport' },
  { href: '/analyses', key: 'savedAnalyses' },
  { href: '/onboarding', key: 'organization' },
] as const;

const copy = {
  en: {
    dashboard: 'Dashboard',
    newImport: 'New Import',
    savedAnalyses: 'Saved Analyses',
    organization: 'Organization',
    darkMode: 'Dark mode',
    language: 'Language',
    signOut: 'Sign out',
    trial: 'Trial',
  },
  fr: {
    dashboard: 'Tableau de bord',
    newImport: 'Nouvel import',
    savedAnalyses: 'Analyses sauvegardées',
    organization: 'Organisation',
    darkMode: 'Mode sombre',
    language: 'Langue',
    signOut: 'Se déconnecter',
    trial: 'Essai',
  },
} as const;

type Lang = keyof typeof copy;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgName, setOrgName] = useState('Workspace');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  const t = useMemo(() => copy[lang], [lang]);

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

    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    const nextLang: Lang = storedLang === 'fr' ? 'fr' : 'en';
    setLang(nextLang);
    document.documentElement.lang = nextLang;
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

  function updateLanguage(nextLang: Lang) {
    setLang(nextLang);
    window.localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    document.documentElement.lang = nextLang;
    window.dispatchEvent(new CustomEvent('img-language-change', { detail: nextLang }));
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
              {t[item.key]}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="main-pane">
        <header className="topbar">
          <div className="topbar-meta">
            <strong>{orgName}</strong>
            <span className="badge">MVP Demo</span>
            <span className="badge warn">{t.trial}</span>
          </div>
          <div className="topbar-actions">
            <label className="toggle-switch" aria-label="Toggle dark mode">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
              <span>{t.darkMode}</span>
            </label>
            <label className="lang-select" aria-label="Select interface language">
              <span>{t.language}</span>
              <select value={lang} onChange={(event) => updateLanguage(event.target.value === 'fr' ? 'fr' : 'en')}>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </label>
            <button type="button" className="btn btn-secondary" onClick={signOut}>{t.signOut}</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

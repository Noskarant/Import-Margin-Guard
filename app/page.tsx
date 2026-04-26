'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    badge: 'Import cost & margin scenario analysis',
    headlineA: 'Make better',
    headlineB: 'import decisions,',
    headlineC: 'faster.',
    subtitle:
      'Import Margin Guard helps import teams compare scenarios, estimate landed costs, and understand margin impact — so you can move forward with confidence.',
    startTrial: 'Try 3 free analyses',
    bookDemo: 'Book a demo',
    signIn: 'Log in',
    features: 'Features',
    useCases: 'Use cases',
    pricing: 'Pricing',
    resources: 'Resources',
    trust1: 'No credit card required',
    trust2: 'Secure by design',
    trust3: 'Built for SMEs & import teams',
    trustedBy: 'Trusted by import teams across industries',
    sector1: 'Manufacturers',
    sector2: 'Distributors',
    sector3: 'Retailers',
    sector4: 'E-commerce',
    bestScenario: 'Best scenario',
    bestScenarioValue: 'France-first',
    savings: 'Savings',
    savingsValue: '€13,200',
    marginUplift: 'Margin uplift',
    marginUpliftValue: '+3.8 pp',
    scenarioComparison: 'Scenario comparison',
    scenarioSubtitle: 'Compare your import scenarios side-by-side and choose the best option.',
    recommended: 'Recommended scenario',
    recommendedName: 'Scenario A — France-first',
    recommendedDesc: 'Best balance of cost and margin',
    allScenarios: 'All scenarios',
    landedCostUnit: 'Landed cost / unit',
    totalLandedCost: 'Total landed cost',
    marginImpact: 'Margin impact',
    baseline: 'Baseline',
    updated: 'Last updated: Today, 09:42',
    note: 'All costs include duties, taxes, fees, freight & insurance.',
  },
  fr: {
    badge: 'Analyse des coûts import & impact marge',
    headlineA: 'Prenez de meilleures',
    headlineB: 'décisions import,',
    headlineC: 'plus vite.',
    subtitle:
      'Import Margin Guard aide les équipes import à comparer leurs scénarios, estimer les landed costs et comprendre l’impact marge — pour décider avec plus de confiance.',
    startTrial: 'Essayer 3 analyses gratuites',
    bookDemo: 'Demander une démo',
    signIn: 'Se connecter',
    features: 'Fonctionnalités',
    useCases: 'Cas d’usage',
    pricing: 'Tarifs',
    resources: 'Ressources',
    trust1: 'Aucune carte requise',
    trust2: 'Sécurisé par conception',
    trust3: 'Conçu pour PME & équipes import',
    trustedBy: 'Pensé pour les équipes import de nombreux secteurs',
    sector1: 'Fabricants',
    sector2: 'Distributeurs',
    sector3: 'Retailers',
    sector4: 'E-commerce',
    bestScenario: 'Meilleur scénario',
    bestScenarioValue: 'France-first',
    savings: 'Économies',
    savingsValue: '13 200 €',
    marginUplift: 'Gain de marge',
    marginUpliftValue: '+3,8 pts',
    scenarioComparison: 'Comparaison de scénarios',
    scenarioSubtitle: 'Comparez vos scénarios import côte à côte et choisissez la meilleure option.',
    recommended: 'Scénario recommandé',
    recommendedName: 'Scénario A — France-first',
    recommendedDesc: 'Meilleur équilibre coût et marge',
    allScenarios: 'Tous les scénarios',
    landedCostUnit: 'Landed cost / unité',
    totalLandedCost: 'Landed cost total',
    marginImpact: 'Impact marge',
    baseline: 'Baseline',
    updated: 'Mis à jour : aujourd’hui, 09:42',
    note: 'Tous les coûts incluent droits, taxes, frais, fret & assurance.',
  },
} as const;

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 3.5L30 8v8.8C30 24.2 25.1 30 18 33C10.9 30 6 24.2 6 16.8V8l12-4.5Z" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.2" />
      <path d="M13 17.6l3.3 3.3L23.6 13" stroke="#2563EB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniIcon({ type }: { type: 'check' | 'lock' | 'users' | 'factory' | 'warehouse' | 'bag' | 'cart' | 'chart' | 'trophy' | 'down' | 'up' | 'gift' | 'file' }) {
  const common = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      {type === 'check' && <><circle cx="12" cy="12" r="9" {...common} /><path d="M8 12.5l2.7 2.7L16.5 9" {...common} /></>}
      {type === 'lock' && <><rect x="5" y="10" width="14" height="10" rx="2" {...common} /><path d="M8 10V7a4 4 0 0 1 8 0v3" {...common} /></>}
      {type === 'users' && <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" {...common} /><circle cx="9.5" cy="7" r="4" {...common} /><path d="M22 21v-2a4 4 0 0 0-3-3.85" {...common} /><path d="M16 3.13a4 4 0 0 1 0 7.75" {...common} /></>}
      {type === 'factory' && <><path d="M3 21h18" {...common} /><path d="M5 21V9l5 3V9l5 3V6h4v15" {...common} /><path d="M8 17h1M12 17h1M16 17h1" {...common} /></>}
      {type === 'warehouse' && <><path d="M3 10l9-6 9 6" {...common} /><path d="M5 10v10h14V10" {...common} /><path d="M9 20v-6h6v6" {...common} /></>}
      {type === 'bag' && <><path d="M6 8h12l-1 12H7L6 8Z" {...common} /><path d="M9 8a3 3 0 0 1 6 0" {...common} /></>}
      {type === 'cart' && <><circle cx="9" cy="20" r="1" {...common} /><circle cx="18" cy="20" r="1" {...common} /><path d="M3 4h2l2.2 11h10.5l2-7H7" {...common} /></>}
      {type === 'chart' && <><path d="M4 18l5-5 4 4 7-9" {...common} /><path d="M14 8h6v6" {...common} /></>}
      {type === 'trophy' && <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" {...common} /><path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3" {...common} /><path d="M12 12v5M9 21h6M10 17h4" {...common} /></>}
      {type === 'down' && <><circle cx="12" cy="12" r="10" fill="#DCFCE7" /><path d="M12 6v11M7 12l5 5 5-5" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></>}
      {type === 'up' && <><circle cx="12" cy="12" r="10" fill="#DBEAFE" /><path d="M12 18V7M7 12l5-5 5 5" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></>}
      {type === 'gift' && <><path d="M20 12v8H4v-8M22 7H2v5h20V7ZM12 7v13" {...common} /><path d="M12 7H8a2 2 0 1 1 2-2c0 2 2 2 2 2ZM12 7h4a2 2 0 1 0-2-2c0 2-2 2-2 2Z" {...common} /></>}
      {type === 'file' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" {...common} /><path d="M14 2v6h6M8 13h8M8 17h6" {...common} /></>}
    </svg>
  );
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    setLang(storedLang === 'fr' ? 'fr' : 'en');

    function onLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<Lang>;
      setLang(customEvent.detail === 'fr' ? 'fr' : 'en');
    }

    window.addEventListener('img-language-change', onLanguageChange as EventListener);
    return () => window.removeEventListener('img-language-change', onLanguageChange as EventListener);
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Import Margin Guard home">
          <ShieldIcon />
          <span>Import Margin Guard</span>
        </Link>

        <div className="nav-links" aria-hidden="true">
          <span>{t.features}<span className="chevron">⌄</span></span>
          <span>{t.useCases}<span className="chevron">⌄</span></span>
          <Link href="/pricing">{t.pricing}</Link>
          <span>{t.resources}<span className="chevron">⌄</span></span>
        </div>

        <div className="nav-actions">
          <Link href="/sign-in" className="login-link">{t.signIn}</Link>
          <Link href="/sign-up" className="nav-cta">{t.startTrial}</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <MiniIcon type="chart" />
            <span>{t.badge}</span>
          </div>

          <h1>
            <span>{t.headlineA}</span>
            <span>{t.headlineB}</span>
            <strong>{t.headlineC}</strong>
          </h1>

          <p className="hero-subtitle">{t.subtitle}</p>

          <div className="hero-actions">
            <Link href="/sign-up" className="primary-btn">{t.startTrial}<span>→</span></Link>
            <Link href="/pricing" className="secondary-btn"><span className="calendar-icon">▣</span>{t.bookDemo}</Link>
          </div>

          <div className="reassurance-row">
            <span><MiniIcon type="check" />{t.trust1}</span>
            <span><MiniIcon type="lock" />{t.trust2}</span>
            <span><MiniIcon type="users" />{t.trust3}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Product preview">
          <div className="bg-orb orb-one" />
          <div className="bg-orb orb-two" />

          <div className="floating-card top-card">
            <div className="floating-icon green"><MiniIcon type="trophy" /></div>
            <div>
              <span>{t.bestScenario}</span>
              <strong>{t.bestScenarioValue}</strong>
            </div>
          </div>

          <div className="floating-card savings-card">
            <MiniIcon type="down" />
            <span>{t.savings}</span>
            <strong>{t.savingsValue}</strong>
            <small>vs baseline</small>
          </div>

          <div className="floating-card margin-card">
            <MiniIcon type="up" />
            <span>{t.marginUplift}</span>
            <strong>{t.marginUpliftValue}</strong>
            <small>vs baseline</small>
          </div>

          <div className="product-window">
            <div className="window-bar">
              <div className="window-dots"><i /><i /><i /></div>
            </div>

            <div className="product-body">
              <aside className="product-sidebar">
                {['Dashboard', 'Scenarios', 'Imports', 'Products', 'Suppliers', 'Reports', 'Settings'].map((item) => (
                  <span key={item} className={item === 'Scenarios' ? 'active' : ''}>{item}</span>
                ))}
              </aside>

              <div className="product-content">
                <div className="product-heading">
                  <div>
                    <h2>{t.scenarioComparison}</h2>
                    <p>{t.scenarioSubtitle}</p>
                  </div>
                </div>

                <div className="recommended-box">
                  <div>
                    <span className="recommended-label">✹ {t.recommended}</span>
                    <h3>{t.recommendedName}</h3>
                    <p>{t.recommendedDesc}</p>
                  </div>
                  <div className="metric"><span>{t.landedCostUnit}</span><strong>€18.42</strong><small>↓ 6.7% vs baseline</small></div>
                  <div className="metric"><span>{t.totalLandedCost}</span><strong>€184,200</strong><small>↓ €13,200 vs baseline</small></div>
                  <div className="metric"><span>{t.marginImpact}</span><strong>+3.8 pp</strong><small>↑ vs baseline</small></div>
                </div>

                <div className="scenario-table">
                  <div className="table-head">
                    <span>{t.allScenarios}</span><span>{t.landedCostUnit}</span><span>{t.totalLandedCost}</span><span>{t.marginImpact}</span>
                  </div>
                  <div className="table-row highlighted"><span>A. France-first <b>({lang === 'fr' ? 'Recommandé' : 'Recommended'})</b></span><span>€18.42</span><span>€184,200</span><span>+3.8 pp</span></div>
                  <div className="table-row"><span>B. Direct import</span><span>€19.63</span><span>€196,300</span><span>+1.2 pp</span></div>
                  <div className="table-row"><span>C. Alternate supplier</span><span>€20.11</span><span>€201,100</span><span className="negative">-0.4 pp</span></div>
                  <div className="table-row"><span>{t.baseline} (Current)</span><span>€19.72</span><span>€197,400</span><span>—</span></div>
                </div>

                <div className="product-note">
                  <span>{t.note}</span>
                  <span>{t.updated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="industry-strip" aria-label="Use cases">
        <p>{t.trustedBy}</p>
        <div className="industry-grid">
          <span><MiniIcon type="factory" />{t.sector1}</span>
          <span><MiniIcon type="warehouse" />{t.sector2}</span>
          <span><MiniIcon type="bag" />{t.sector3}</span>
          <span><MiniIcon type="cart" />{t.sector4}</span>
        </div>
      </section>

      <section className="feature-cards" aria-label="Product highlights">
        <article><div><MiniIcon type="gift" /></div><strong>3 free analyses</strong><span>No credit card required</span></article>
        <article><div><MiniIcon type="file" /></div><strong>PDF export</strong><span>Share and present easily</span></article>
        <article><div><MiniIcon type="lock" /></div><strong>Private data</strong><span>Secure by design</span></article>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 76% 26%, rgba(37, 99, 235, 0.14), transparent 32%),
            radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.08), transparent 25%),
            linear-gradient(180deg, #ffffff 0%, #fbfdff 48%, #f8fbff 100%);
          color: #0f172a;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .landing-nav {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(24px, 5vw, 72px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          position: relative;
          z-index: 20;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
          text-decoration: none;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.04em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: clamp(22px, 3vw, 44px);
          color: #0f172a;
          font-weight: 700;
          font-size: 17px;
        }

        .nav-links a,
        .nav-links span {
          color: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .chevron { color: #64748b; font-size: 18px; transform: translateY(-1px); }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          font-size: 17px;
          font-weight: 700;
        }

        .login-link {
          color: #0f172a;
          text-decoration: none;
        }

        .nav-cta,
        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: 1px solid rgba(37, 99, 235, 0.55);
          border-radius: 10px;
          box-shadow: 0 14px 36px rgba(37, 99, 235, 0.24);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .nav-cta { padding: 12px 24px; }
        .primary-btn { padding: 14px 22px; font-size: 17px; font-weight: 800; min-width: 220px; }

        .nav-cta:hover,
        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 44px rgba(37, 99, 235, 0.32);
        }

        .hero-section {
          display: grid;
          grid-template-columns: minmax(420px, 0.92fr) minmax(520px, 1.08fr);
          align-items: center;
          gap: clamp(24px, 3.5vw, 54px);
          min-height: calc(100vh - 72px);
          padding: clamp(28px, 4.4vw, 56px) clamp(28px, 5vw, 88px) clamp(22px, 3vw, 34px);
          position: relative;
        }

        .hero-copy { position: relative; z-index: 5; max-width: 590px; }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #eaf2ff;
          color: #2563eb;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          display: grid;
          gap: 0;
          color: #0f172a;
          font-size: clamp(44px, 4.6vw, 68px);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 850;
        }

        h1 strong {
          color: #2563eb;
          font-weight: 850;
        }

        .hero-subtitle {
          margin: 22px 0 0;
          color: #475569;
          font-size: clamp(16px, 1.15vw, 19px);
          line-height: 1.55;
          max-width: 560px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .secondary-btn {
          min-width: 220px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 13px 20px;
          border-radius: 10px;
          color: #2563eb;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(37, 99, 235, 0.55);
          text-decoration: none;
          font-size: 17px;
          font-weight: 800;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        }

        .calendar-icon { font-size: 18px; }

        .reassurance-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 26px;
          color: #475569;
          font-size: 14px;
          font-weight: 650;
        }

        .reassurance-row span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #475569;
        }

        .reassurance-row svg { color: #2563eb; }

        .hero-visual {
          position: relative;
          min-height: 470px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-orb {
          position: absolute;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(147, 197, 253, 0.08));
          filter: blur(0.2px);
        }

        .orb-one { width: 560px; height: 560px; right: -120px; top: -86px; }
        .orb-two { width: 320px; height: 320px; left: 10px; bottom: -40px; opacity: 0.7; }

        .product-window {
          width: min(100%, 720px);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(148, 163, 184, 0.18);
          box-shadow: 0 36px 90px rgba(15, 23, 42, 0.16);
          overflow: hidden;
          position: relative;
          z-index: 4;
        }

        .window-bar {
          height: 36px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255, 255, 255, 0.72);
        }

        .window-dots { display: flex; gap: 8px; }
        .window-dots i { width: 12px; height: 12px; border-radius: 999px; display: block; }
        .window-dots i:nth-child(1) { background: #ff5f57; }
        .window-dots i:nth-child(2) { background: #ffbd2e; }
        .window-dots i:nth-child(3) { background: #28c840; }

        .product-body { display: grid; grid-template-columns: 112px 1fr; min-height: 390px; }

        .product-sidebar {
          display: grid;
          align-content: start;
          gap: 8px;
          padding: 22px 12px;
          border-right: 1px solid rgba(148, 163, 184, 0.18);
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .product-sidebar span {
          padding: 9px 10px;
          border-radius: 8px;
        }

        .product-sidebar .active {
          color: #2563eb;
          background: #eff6ff;
        }

        .product-content { padding: 22px 22px 18px; }
        .product-heading h2 { margin: 0; color: #0f172a; font-size: 20px; letter-spacing: -0.04em; }
        .product-heading p { margin: 6px 0 0; color: #64748b; font-size: 11px; }

        .recommended-box {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1.25fr repeat(3, 0.8fr);
          gap: 16px;
          align-items: center;
          padding: 13px 14px;
          border-radius: 10px;
          border: 1px solid rgba(37, 99, 235, 0.45);
          background: linear-gradient(180deg, #f8fbff, #ffffff);
        }

        .recommended-label { color: #2563eb; font-weight: 850; font-size: 11px; }
        .recommended-box h3 { margin: 10px 0 4px; font-size: 16px; color: #0f172a; }
        .recommended-box p { margin: 0; color: #64748b; font-size: 11px; }
        .metric span { display: block; color: #64748b; font-size: 11px; font-weight: 700; }
        .metric strong { display: block; margin-top: 5px; color: #16a34a; font-size: 18px; }
        .metric small { display: block; margin-top: 4px; color: #16a34a; font-size: 10px; }

        .scenario-table {
          margin-top: 12px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 10px;
          overflow: hidden;
          color: #334155;
          font-size: 11px;
        }

        .table-head,
        .table-row {
          display: grid;
          grid-template-columns: 1.45fr 0.9fr 0.9fr 0.75fr;
          gap: 10px;
          padding: 9px 12px;
          align-items: center;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
        }

        .table-head { color: #64748b; font-weight: 800; font-size: 11px; background: #fbfdff; }
        .table-row { font-weight: 650; }
        .table-row.highlighted { background: #eff6ff; color: #1d4ed8; }
        .negative { color: #ef4444; }

        .product-note {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #94a3b8;
          font-size: 11px;
          padding: 9px 12px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .floating-card {
          position: absolute;
          z-index: 8;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.18);
          box-shadow: 0 22px 52px rgba(15, 23, 42, 0.14);
          border-radius: 16px;
          color: #0f172a;
        }

        .top-card {
          top: 10px;
          right: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 22px;
        }

        .floating-card span,
        .floating-card small { display: block; color: #475569; font-size: 13px; font-weight: 700; }
        .floating-card strong { display: block; color: #16a34a; font-size: 20px; margin-top: 4px; }
        .floating-icon { color: #16a34a; }

        .savings-card,
        .margin-card {
          width: 124px;
          padding: 14px;
          display: grid;
          gap: 8px;
        }

        .savings-card { right: -16px; top: 278px; }
        .margin-card { right: 34px; bottom: 48px; }
        .margin-card strong { color: #2563eb; }

        .industry-strip {
          position: relative;
          z-index: 5;
          margin: 8px auto 0;
          padding: 8px clamp(24px, 5vw, 80px) 0;
          max-width: 1220px;
          text-align: center;
        }

        .industry-strip p {
          margin: 0 0 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 13px;
          font-weight: 850;
        }

        .industry-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          align-items: center;
        }

        .industry-grid span {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #334155;
          font-size: 17px;
          font-weight: 750;
          border-right: 1px solid rgba(148, 163, 184, 0.22);
        }

        .industry-grid span:last-child { border-right: 0; }
        .industry-grid svg { color: #2563eb; }

        .feature-cards {
          display: none;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          max-width: 980px;
          margin: 34px auto 40px;
          padding: 0 24px;
        }

        .feature-cards article {
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 16px;
          align-items: center;
          padding: 18px 24px;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .feature-cards article div {
          grid-row: span 2;
          color: #2563eb;
          width: 52px;
          height: 52px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #eff6ff;
        }

        .feature-cards strong { font-size: 18px; color: #0f172a; }
        .feature-cards span { color: #64748b; font-size: 14px; }

        @media (min-width: 1181px) and (max-height: 850px) {
          .landing-nav { height: 64px; }
          .hero-section { min-height: calc(100vh - 64px); padding-top: 22px; padding-bottom: 18px; }
          .eyebrow { margin-bottom: 18px; padding: 8px 12px; }
          h1 { font-size: clamp(42px, 4.2vw, 60px); }
          .hero-subtitle { margin-top: 16px; font-size: 16px; line-height: 1.45; }
          .hero-actions { margin-top: 22px; }
          .reassurance-row { margin-top: 22px; }
          .hero-visual { min-height: 430px; }
          .product-window { width: min(100%, 680px); }
          .product-body { min-height: 365px; }
          .industry-strip { display: none; }
        }

        @media (max-width: 1180px) {
          .hero-section { grid-template-columns: 1fr; padding-top: 48px; }
          .hero-copy { max-width: 760px; }
          .hero-visual { min-height: 520px; }
          .nav-links { display: none; }
        }

        @media (max-width: 760px) {
          .landing-nav { height: auto; padding: 18px 20px; gap: 14px; flex-wrap: wrap; }
          .brand { font-size: 20px; }
          .nav-actions { margin-left: auto; font-size: 14px; }
          .login-link { display: none; }
          .nav-cta { padding: 10px 14px; }
          .hero-section { padding: 42px 20px 28px; }
          h1 { font-size: clamp(46px, 12vw, 62px); }
          .primary-btn, .secondary-btn { width: 100%; min-width: 0; }
          .reassurance-row { align-items: flex-start; flex-direction: column; }
          .hero-visual { min-height: 0; display: block; }
          .floating-card { display: none; }
          .product-body { grid-template-columns: 1fr; }
          .product-sidebar { display: none; }
          .product-content { padding: 20px; }
          .recommended-box { grid-template-columns: 1fr; }
          .table-head, .table-row { grid-template-columns: 1.2fr 0.8fr; }
          .table-head span:nth-child(n+3), .table-row span:nth-child(n+3) { display: none; }
          .product-note { flex-direction: column; }
          .industry-grid { grid-template-columns: 1fr 1fr; row-gap: 10px; }
          .industry-grid span { border-right: 0; font-size: 14px; }
        }
      `}</style>
    </main>
  );
}

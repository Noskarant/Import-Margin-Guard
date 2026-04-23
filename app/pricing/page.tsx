'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'fr';
const LANG_STORAGE_KEY = 'img_lang';

const copy = {
  en: {
    title: 'Pricing built for import cost decisions',
    subtitle: 'Choose a plan that matches your sourcing workflow. Start simply, move to Pro when you need unlimited analysis, and contact us for team deployment.',
    monthly: '/ month',
    starterDesc: 'For solo buyers and small companies testing the workflow.',
    proDesc: 'For teams that need unlimited comparison and PDF export.',
    teamDesc: 'For purchasing teams that want broader access and dedicated support.',
    pilotTitle: 'Pilot launch',
    pilotText: 'Guided launch offer for early users who want the Pro plan with direct feedback loop included.',
    pilotPrice: '€199',
    pilotMeta: '3 months Pro · feedback included',
    analyses: 'Analyses',
    users: 'Users',
    pdf: 'PDF export',
    history: 'History',
    support: 'Support',
    starter: 'Starter',
    pro: 'Pro',
    team: 'Team',
    unlimited: 'Unlimited',
    perMonth5: '5 / month',
    user1: '1',
    user3: '3',
    user10: '10',
    none: '—',
    days30: '30 days',
    full: 'Full',
    email: 'Email',
    priority: 'Priority',
    dedicated: 'Dedicated',
    included: 'Included',
    notIncluded: 'Not included',
    mostPractical: 'Most practical',
    contactLead: 'Contact-led',
    startStarter: 'Start Starter',
    startPro: 'Start Pro',
    contactUs: 'Contact us',
    startPilot: 'Start pilot',
    comparePlans: 'Quick comparison',
    faqTitle: 'Simple answers before you start',
    faq1q: 'Who is Starter for?',
    faq1a: 'Starter is for solo buyers, small importers, and early testing before a wider rollout.',
    faq2q: 'Why is Pro highlighted?',
    faq2a: 'Pro is the most practical plan when you want unlimited analyses, PDF export, and room for a small purchasing team.',
    faq3q: 'Why does Team use contact instead of self-serve checkout?',
    faq3a: 'At this level, teams usually want a short conversation before rollout, especially around onboarding and support expectations.',
    faq4q: 'What is the pilot launch?',
    faq4a: 'The pilot launch is a guided entry offer: 3 months of Pro access for €199, with direct feedback included.',
    backHome: 'Back to home',
    viewPricing: 'View pricing',
  },
  fr: {
    title: 'Des tarifs pensés pour les décisions de coût import',
    subtitle: 'Choisissez le plan qui correspond à votre fonctionnement achat. Commencez simplement, passez sur Pro pour des analyses illimitées, et contactez-nous pour un déploiement équipe.',
    monthly: '/ mois',
    starterDesc: 'Pour les acheteurs seuls et les petites structures qui testent le flow.',
    proDesc: 'Pour les équipes qui ont besoin de comparaisons illimitées et de l’export PDF.',
    teamDesc: 'Pour les équipes achat qui veulent plus d’accès et un support dédié.',
    pilotTitle: 'Lancement pilot',
    pilotText: 'Offre de lancement accompagnée pour les premiers utilisateurs qui veulent le plan Pro avec boucle de feedback directe.',
    pilotPrice: '199 €',
    pilotMeta: '3 mois de Pro · feedback inclus',
    analyses: 'Analyses',
    users: 'Utilisateurs',
    pdf: 'Export PDF',
    history: 'Historique',
    support: 'Support',
    starter: 'Starter',
    pro: 'Pro',
    team: 'Team',
    unlimited: 'Illimitées',
    perMonth5: '5 / mois',
    user1: '1',
    user3: '3',
    user10: '10',
    none: '—',
    days30: '30 jours',
    full: 'Complet',
    email: 'Email',
    priority: 'Prioritaire',
    dedicated: 'Dédié',
    included: 'Inclus',
    notIncluded: 'Non inclus',
    mostPractical: 'Le plus pratique',
    contactLead: 'Avec contact',
    startStarter: 'Commencer Starter',
    startPro: 'Commencer Pro',
    contactUs: 'Nous contacter',
    startPilot: 'Lancer le pilot',
    comparePlans: 'Comparaison rapide',
    faqTitle: 'Réponses simples avant de démarrer',
    faq1q: 'À qui s’adresse Starter ?',
    faq1a: 'Starter s’adresse aux acheteurs seuls, aux petits importateurs et aux premiers tests avant un déploiement plus large.',
    faq2q: 'Pourquoi Pro est mis en avant ?',
    faq2a: 'Pro est le plan le plus pratique quand vous voulez des analyses illimitées, l’export PDF et de la place pour une petite équipe achat.',
    faq3q: 'Pourquoi Team passe par un contact et pas par un checkout direct ?',
    faq3a: 'À ce niveau, les équipes veulent souvent un court échange avant le déploiement, notamment sur l’onboarding et le support.',
    faq4q: 'Qu’est-ce que le pilot launch ?',
    faq4a: 'Le pilot launch est une offre d’entrée accompagnée : 3 mois d’accès Pro pour 199 €, avec feedback direct inclus.',
    backHome: 'Retour à l’accueil',
    viewPricing: 'Voir les tarifs',
  },
} as const;

function featureValueLabel(value: boolean, t: (typeof copy)['en']) {
  return value ? t.included : t.notIncluded;
}

export default function PricingPage() {
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

  const plans = [
    {
      name: t.starter,
      price: '39 €',
      description: t.starterDesc,
      analyses: t.perMonth5,
      users: t.user1,
      pdf: false,
      history: t.days30,
      support: t.email,
      cta: t.startStarter,
      href: '/sign-up',
      featured: false,
      badge: null,
    },
    {
      name: t.pro,
      price: '79 €',
      description: t.proDesc,
      analyses: t.unlimited,
      users: t.user3,
      pdf: true,
      history: t.full,
      support: t.priority,
      cta: t.startPro,
      href: '/sign-up',
      featured: true,
      badge: t.mostPractical,
    },
    {
      name: t.team,
      price: '149 €',
      description: t.teamDesc,
      analyses: t.unlimited,
      users: t.user10,
      pdf: true,
      history: t.full,
      support: t.dedicated,
      cta: t.contactUs,
      href: 'mailto:hello@importmarginguard.com?subject=Import%20Margin%20Guard%20Team%20Plan',
      featured: false,
      badge: t.contactLead,
    },
  ];

  return (
    <main className="auth-shell" style={{ alignContent: 'start', paddingTop: 48, paddingBottom: 48 }}>
      <section className="auth-card" style={{ width: 'min(100%, 1180px)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ marginTop: 0, marginBottom: 10 }}>Import Margin Guard</h1>
            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 32 }}>{t.title}</h2>
            <p className="muted" style={{ marginTop: 0, maxWidth: 860 }}>{t.subtitle}</p>
          </div>
          <Link className="btn btn-secondary" href="/">{t.backHome}</Link>
        </div>

        <section className="card" style={{ marginTop: 24, background: 'var(--warn-bg)', borderColor: 'var(--warn-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="badge warn" style={{ marginBottom: 10 }}>{t.pilotTitle}</div>
              <h3 style={{ margin: 0, fontSize: 30 }}>{t.pilotPrice}</h3>
              <p style={{ margin: '10px 0 6px' }}>{t.pilotMeta}</p>
              <p className="muted" style={{ margin: 0 }}>{t.pilotText}</p>
            </div>
            <a className="btn btn-primary" href="mailto:hello@importmarginguard.com?subject=Import%20Margin%20Guard%20Pilot">{t.startPilot}</a>
          </div>
        </section>

        <section className="grid-3" style={{ marginTop: 24 }}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="card"
              style={plan.featured ? { borderColor: 'var(--primary)', boxShadow: '0 10px 30px rgba(29,78,216,0.08)' } : undefined}
            >
              <div style={{ minHeight: 28 }}>
                {plan.badge ? <span className={`badge ${plan.featured ? 'success' : ''}`}>{plan.badge}</span> : null}
              </div>
              <h3 style={{ marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.1 }}>{plan.price}<span style={{ fontSize: 18, fontWeight: 500, color: 'var(--muted)' }}> {t.monthly}</span></div>
              <p className="muted" style={{ minHeight: 48 }}>{plan.description}</p>
              <div className="highlight-list">
                <div className="highlight-item"><strong>{t.analyses}</strong>{plan.analyses}</div>
                <div className="highlight-item"><strong>{t.users}</strong>{plan.users}</div>
                <div className="highlight-item"><strong>{t.pdf}</strong>{featureValueLabel(plan.pdf, t)}</div>
                <div className="highlight-item"><strong>{t.history}</strong>{plan.history}</div>
                <div className="highlight-item"><strong>{t.support}</strong>{plan.support}</div>
              </div>
              <div className="actions" style={{ marginTop: 20 }}>
                {plan.href.startsWith('mailto:') ? (
                  <a className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} href={plan.href}>{plan.cta}</a>
                ) : (
                  <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} href={plan.href}>{plan.cta}</Link>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>{t.comparePlans}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>{t.analyses}</th>
                  <th>{t.users}</th>
                  <th>{t.pdf}</th>
                  <th>{t.history}</th>
                  <th>{t.support}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t.starter}</td>
                  <td>{t.perMonth5}</td>
                  <td>{t.user1}</td>
                  <td>{t.none}</td>
                  <td>{t.days30}</td>
                  <td>{t.email}</td>
                </tr>
                <tr className="row-highlight-base">
                  <td>{t.pro}</td>
                  <td>{t.unlimited}</td>
                  <td>{t.user3}</td>
                  <td>✓</td>
                  <td>{t.full}</td>
                  <td>{t.priority}</td>
                </tr>
                <tr>
                  <td>{t.team}</td>
                  <td>{t.unlimited}</td>
                  <td>{t.user10}</td>
                  <td>✓</td>
                  <td>{t.full}</td>
                  <td>{t.dedicated}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid-2" style={{ marginTop: 24 }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>{t.faqTitle}</h3>
            <div className="highlight-list">
              <div className="highlight-item"><strong>{t.faq1q}</strong>{t.faq1a}</div>
              <div className="highlight-item"><strong>{t.faq2q}</strong>{t.faq2a}</div>
            </div>
          </article>
          <article className="card" style={{ marginTop: 0 }}>
            <h3 style={{ marginTop: 0, visibility: 'hidden' }}>{t.faqTitle}</h3>
            <div className="highlight-list">
              <div className="highlight-item"><strong>{t.faq3q}</strong>{t.faq3a}</div>
              <div className="highlight-item"><strong>{t.faq4q}</strong>{t.faq4a}</div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

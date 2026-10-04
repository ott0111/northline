import Link from 'next/link';
import { db, ensureTalentTable } from '@/lib/db';

import { seedTalent, type Talent } from '@/lib/talent';

async function getTalent(): Promise<Talent[]> {
  if (!db) return seedTalent;
  try {
    await ensureTalentTable();
    const rows = await db`SELECT talent_handle AS "talentHandle", name, bio, category, discipline, pfp
      FROM northline_talent_profiles WHERE public_status='published' ORDER BY created_at ASC`;
    return rows.length ? rows as Talent[] : seedTalent;
  } catch {
    return seedTalent;
  }
}

export default async function RosterPage() {
  const talent = await getTalent();
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header id="siteHeader">
      <Link href="/" className="logo"><img src="/assets/logo-mark.png" alt="" />Northline</Link>
      <nav className="primary-nav"><div className="nav-links">{[['Talent','/talent.html'],['Team','/team.html'],['Past Work','/past-work.html'],['Services','/services.html'],['For Brands','/work.html'],['About','/about.html']].map(([l,h])=><Link key={h} href={h}>{l}</Link>)}</div><Link href="/apply.html" className="btn btn-primary">Apply ↗</Link></nav>
      <button className="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><span/><span/><span/></button>
    </header>
    <main id="main-content">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Northline Index</span></nav>
      <section className="page-hero"><div className="page-hero-bg"/><div className="wrap"><div className="eyebrow">Northline <span className="dot">/</span> Index</div><h1>The Northline<br/><em>index.</em></h1><p className="page-sub">A directory of the people Northline represents and the team building around them.</p></div></section>
      <section><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">01 / TALENT</div><h2>Represented<br/><em>talent.</em></h2></div><Link href="/talent.html" className="text-link">Open full roster →</Link></div>
        <div className="index-list reveal">{talent.map((person,index)=><Link href={`/talent/${person.talentHandle}`} key={person.talentHandle}><span>{String(index+1).padStart(2,'0')}</span><strong>{person.name}</strong><small>{person.discipline}</small><b>View →</b></Link>)}</div>
      </div></section>
      <section className="dark-section"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">02 / NORTHLINE</div><h2>The people<br/><em>behind it.</em></h2></div><Link href="/team.html" className="text-link">Meet the team →</Link></div><div className="index-stats reveal"><div><strong>03</strong><span>Founders</span></div><div><strong>07</strong><span>Owners / Co-Owners</span></div><div><strong>03</strong><span>Operations</span></div><div><strong>05</strong><span>Designers</span></div></div></div></section>
    </main>
  </>;
}

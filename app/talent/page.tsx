import Link from 'next/link';
import { db, ensureTalentTable } from '@/lib/db';
import { seedTalent, type Talent } from '@/lib/talent';
import TalentGrid from './talent-grid';

async function getTalent(): Promise<Talent[]> {
  if (!db) return seedTalent;
  try {
    await ensureTalentTable();
    const rows = await db`SELECT talent_handle AS "talentHandle", name, bio, category, discipline, pfp, socials
      FROM northline_talent_profiles WHERE public_status='published' ORDER BY created_at ASC`;
    return rows.length ? rows as Talent[] : seedTalent;
  } catch {
    return seedTalent;
  }
}

export const metadata = {
  title: 'Talent',
  description: 'Meet the creators, competitive players, and digital talent represented by Northline.',
};

export default async function TalentPage() {
  const talent = await getTalent();
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header id="siteHeader">
      <Link href="/" className="logo"><img src="/assets/logo-mark.png" alt="" />Northline</Link>
      <nav className="primary-nav"><div className="nav-links">
        {['Talent','Team','Past Work','Services','For Brands','About'].map((label) => {
          const href = {'Talent':'/talent','Team':'/team.html','Past Work':'/past-work.html','Services':'/services.html','For Brands':'/work.html','About':'/about.html'}[label]!;
          return <Link key={label} href={href} className={label === 'Talent' ? 'active' : ''}>{label}</Link>;
        })}
      </div><Link href="/apply.html" className="btn btn-primary">Apply ↗</Link></nav>
      <button className="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><span/><span/><span/></button>
    </header>
    <main id="main-content">
      <section className="page-hero"><div className="page-hero-bg"/><div className="wrap"><div className="eyebrow">Northline <span className="dot">/</span> Talent</div><h1>The people<br/>we <em>represent.</em></h1><p className="page-sub">Browse the Northline roster by category. Open a profile for public links and representation context.</p></div></section>
      <section className="talent-showcase"><div className="wrap">
        <div className="section-heading reveal"><div><div className="section-number">01 / ROSTER</div><h2>Find your<br/><em>talent.</em></h2></div><p>Open a profile for public links and representation context.</p></div>
        <TalentGrid talent={talent}/>
        <div className="roster-note"><span>ROSTER NOTE</span><p>Profiles show public information only. Performance figures are added only when verified and intentionally published.</p></div>
      </div></section>
      <section className="brand-overview"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">02 / FOR BRANDS</div><h2>Need talent?<br/><em>Start here.</em></h2></div><Link href="/work.html" className="text-link">Brand partnerships →</Link></div><div className="brand-mini-grid reveal"><div><span>01</span><h3>Browse</h3><p>Review represented talent and identify who fits your audience.</p></div><div><span>02</span><h3>Match</h3><p>Use the relevant talent to shape the partnership.</p></div><div><span>03</span><h3>Build</h3><p>Northline coordinates the partnership around the talent.</p></div></div></div></section>
      <section className="dark-section"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">03 / REPRESENTATION</div><h2>What talent<br/><em>gets.</em></h2></div></div><div className="points-grid reveal"><div><span>01</span><h3>Opportunities</h3><p>We help identify and manage opportunities that fit the talent, audience, and direction.</p></div><div><span>02</span><h3>Partnerships</h3><p>We handle brand conversations and help turn partnerships into something useful.</p></div><div><span>03</span><h3>Support</h3><p>Direct communication, planning, and operational help that keeps everything moving.</p></div><div><span>04</span><h3>Long-term</h3><p>We're building careers and relationships, not chasing one-off moments.</p></div></div></div></section>
      <section className="final-cta"><div className="final-cta-bg"/><div className="wrap final-cta-inner reveal"><div className="section-number">NEXT / NORTHLINE</div><h2>Let's build<br/><em>what's next.</em></h2><p>Looking for representation, talent, or a partnership? Start the conversation.</p><Link href="/apply.html" className="btn btn-primary">Apply to Northline ↗</Link></div></section>
    </main>
  </>;
}

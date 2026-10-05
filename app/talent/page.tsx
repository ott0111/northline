import Link from 'next/link';
import { db, ensureTalentTable } from '@/lib/db';
import { seedTalent } from '@/lib/talent';

async function getTalent() {
  if (!db) return seedTalent;
  try {
    await ensureTalentTable();
    const rows = await db`SELECT talent_handle AS "talentHandle", name, bio, category, discipline, pfp FROM northline_talent_profiles WHERE public_status='published' ORDER BY created_at ASC`;
    return rows.length ? rows : seedTalent;
  } catch { return seedTalent; }
}

export default async function TalentPage() {
  const talent = await getTalent();
  return <main id="main-content">
    <section className="page-hero"><div className="page-hero-bg"/><div className="wrap"><div className="eyebrow">Northline <span className="dot">/</span> Talent</div><h1>The people<br/>we <em>represent.</em></h1><p className="page-sub">Creators, competitive players, and digital talent represented by Northline.</p></div></section>
    <section className="talent-showcase"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">01 / ROSTER</div><h2>Find your<br/><em>talent.</em></h2></div><p>Explore the Northline roster and open a profile for public links and representation context.</p></div>
      <div className="talent-grid talent-grid-five reveal">{talent.map((person,index)=><Link className="talent-card talent-card-link" key={person.talentHandle} href={`/talent/${person.talentHandle}`}><div className="talent-card-top"><span>{String(index+1).padStart(2,'0')}</span><span>{person.discipline.toUpperCase()}</span></div><span className="talent-photo">{person.pfp && <img src={person.pfp} alt={person.name}/>}</span><div><h3>{person.name}</h3><p>{person.bio || person.discipline}</p><span className="talent-social">@{person.talentHandle} ↗</span></div></Link>)}</div>
      <div className="roster-note"><span>ROSTER NOTE</span><p>Profiles show public information only. Performance figures are added only when verified and intentionally published.</p></div>
    </div></section>
    <section className="dark-section"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">02 / REPRESENTATION</div><h2>What talent<br/><em>gets.</em></h2></div></div><div className="points-grid reveal"><div><span>01</span><h3>Opportunities</h3><p>We help identify and manage opportunities that fit the talent, audience, and direction.</p></div><div><span>02</span><h3>Partnerships</h3><p>We handle brand conversations and help turn partnerships into something useful.</p></div><div><span>03</span><h3>Support</h3><p>Direct communication, planning, and operational help that keeps everything moving.</p></div><div><span>04</span><h3>Long-term</h3><p>We're building careers and relationships, not chasing one-off moments.</p></div></div></div></section>
    <section className="final-cta"><div className="wrap final-cta-inner reveal"><div className="section-number">NEXT / NORTHLINE</div><h2>Let's build<br/><em>what's next.</em></h2><p>Looking for representation, talent, or a partnership? Start the conversation.</p><Link href="/apply" className="btn btn-primary">Apply to Northline ↗</Link></div></section>
  </main>;
}
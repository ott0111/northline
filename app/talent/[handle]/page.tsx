import Link from 'next/link';
import { db, ensureTalentTable } from '@/lib/db';
import type { Talent } from '../../roster/page';

const seed: Record<string, Talent & { socials: Record<string,string> }> = {
  hxvacfn:{talentHandle:'hxvacfn',name:'Hxvacfn',bio:'Competitive talent represented on the Northline roster.',category:'Talent',discipline:'Fortnite / Competitive',pfp:'/assets/hxvacfnpfp.jpg',socials:{x:'https://x.com/hxvacfn',youtube:'https://www.youtube.com/@HxvacfnFN',twitch:'https://www.twitch.tv/hxvac_'}},
  kingston:{talentHandle:'kingston',name:'Kingston',bio:'Competitive talent represented on the Northline roster.',category:'Talent',discipline:'Fortnite / Competitive',pfp:'/assets/kingstonfnpfp.jpg',socials:{x:'https://x.com/KingstonFN_',twitch:'https://www.twitch.tv/kingstonfn_'}},
  creep:{talentHandle:'creep',name:'Creep',bio:'Competitive talent represented on the Northline roster.',category:'Talent',discipline:'Fortnite / Competitive',pfp:'/assets/creeppfp.jpg',socials:{x:'https://x.com/CreepWtff'}},
  joki:{talentHandle:'joki',name:'Joki',bio:'Competitive talent represented on the Northline roster.',category:'Talent',discipline:'Fortnite / Competitive',pfp:'/assets/jokifnxpfp.jpg',socials:{x:'https://x.com/jokifnx'}},
  devade:{talentHandle:'devade',name:'Devade',bio:'Competitive talent represented on the Northline roster.',category:'Talent',discipline:'Fortnite / Competitive',pfp:'/assets/devadefvpfp.jpg',socials:{x:'https://x.com/devadefv'}},
  drgxpb:{talentHandle:'drgxpb',name:'drgxpb',bio:'Creator talent represented on the Northline roster.',category:'Creator',discipline:'Creator / Digital',pfp:'',socials:{x:'https://x.com/drgxpb'}},
};

async function getProfile(handle:string) {
  const fallback=seed[handle.toLowerCase()];
  if (!db) return fallback;
  try {
    await ensureTalentTable();
    const rows=await db`SELECT talent_handle AS "talentHandle", name, bio, category, discipline, pfp, socials
      FROM northline_talent_profiles WHERE lower(talent_handle)=lower(${handle}) AND public_status='published' LIMIT 1`;
    return rows[0] ? rows[0] as typeof fallback : fallback;
  } catch { return fallback; }
}

export default async function TalentProfilePage({handle}:{handle:string}) {
  const profile=await getProfile(handle);
  if (!profile) return <main className="wrap"><h1>Talent not found.</h1><Link href="/roster">Back to roster</Link></main>;
  const socials=profile.socials ?? {};
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header id="siteHeader"><Link href="/" className="logo"><img src="/assets/logo-mark.png" alt=""/>Northline</Link><nav className="primary-nav"><div className="nav-links">{[['Talent','/talent.html'],['Team','/team.html'],['Past Work','/past-work.html'],['Services','/services.html'],['For Brands','/work.html'],['About','/about.html']].map(([l,h])=><Link key={h} href={h}>{l}</Link>)}</div><Link href="/apply.html" className="btn btn-primary">Apply ↗</Link></nav><button className="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><span/><span/><span/></button></header>
    <main id="main-content" data-talent-handle={profile.talentHandle}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/roster">Talent</Link><span>/</span><span>{profile.name}</span></nav>
      <section className="profile-hero"><div className="profile-hero-bg"/><div className="wrap"><Link className="back-link" href="/roster">← Back to Talent</Link><div className="profile-layout reveal"><div className="profile-image">{profile.pfp && <img src={profile.pfp} alt={profile.name}/>}</div><div className="profile-copy"><div className="eyebrow">Northline <span className="dot">/</span> Talent</div><div className="profile-label"><span>{profile.discipline.toUpperCase()}</span></div><h1>{profile.name}</h1><p>{profile.bio}</p><div className="profile-actions">{socials.x && <a href={socials.x} target="_blank" rel="noopener noreferrer" className="btn btn-primary">X / {profile.talentHandle} ↗</a>}<Link href={`/work.html?talent=${encodeURIComponent(profile.name)}#brand-brief`} className="btn btn-primary">Work With This Talent →</Link></div></div></div></div></section>
      <section><div className="wrap profile-info-grid reveal"><div><div className="section-number">01 / PROFILE</div><h2>{profile.category}<br/><em>{profile.discipline.split(' / ')[0]}.</em></h2></div><div><p className="lead">Public profile links</p><p>Northline keeps this page focused on public information and representation.</p><div className="profile-links">{Object.entries(socials).map(([platform,url])=><a key={platform} href={url} target="_blank" rel="noopener noreferrer"><strong>{platform === 'x' ? '@'+profile.talentHandle : platform.charAt(0).toUpperCase()+platform.slice(1)}</strong><b>↗</b></a>)}</div></div></div></section>
      <section className="dark-section"><div className="wrap"><div className="section-heading reveal"><div><div className="section-number">02 / NORTHLINE</div><h2>Built around<br/><em>talent.</em></h2></div></div><div className="profile-standard reveal"><div><span>01</span><h3>Representation</h3><p>Support around opportunities, partnerships, and career direction.</p></div><div><span>02</span><h3>Partnerships</h3><p>Brand opportunities that fit the talent and audience.</p></div><div><span>03</span><h3>Growth</h3><p>Long-term support built around the person behind the profile.</p></div></div></div></section>
      <section className="final-cta"><div className="wrap final-cta-inner reveal"><div className="section-number">NEXT / NORTHLINE</div><h2>Explore the<br/><em>roster.</em></h2><p>See more Northline talent or learn how to work with the agency.</p><div className="cta-row"><Link href="/roster" className="btn btn-primary">View Talent →</Link><Link href="/work.html" className="btn btn-ghost">For Brands →</Link></div></div></section>
    </main>
  </>;
}

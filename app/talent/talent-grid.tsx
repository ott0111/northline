'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Talent } from '@/lib/talent';

export default function TalentGrid({ talent }: { talent: Talent[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => talent.filter((person) => {
    const haystack = [person.name, person.discipline, person.category, person.talentHandle].join(' ').toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || haystack.includes(filter);
    return matchesQuery && matchesFilter;
  }), [talent, query, filter]);

  return <div className="talent-controls-wrap">
    <div className="talent-controls reveal">
      <label className="talent-search"><span>Search roster</span><input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search talent..." autoComplete="off"/></label>
      <div className="talent-filters" role="group" aria-label="Filter talent">
        {['all','competitive','creator','digital'].map((item) => <button key={item} type="button" className={filter === item ? 'talent-filter active' : 'talent-filter'} onClick={() => setFilter(item)}>{item === 'all' ? 'All' : item[0].toUpperCase()+item.slice(1)}</button>)}
      </div>
    </div>
    <div className="talent-grid talent-grid-five reveal">
      {filtered.map((person, index) => <Link className="talent-card talent-card-link" key={person.talentHandle} href={`/talent/${person.talentHandle}`}>
        <div className="talent-card-top"><span>{String(index+1).padStart(2,'0')}</span><span>{person.discipline.toUpperCase()}</span></div>
        <span className="talent-photo">{person.pfp && <img src={person.pfp} alt={person.name}/>}</span>
        <div><h3>{person.name}</h3><p>{person.bio || person.discipline}</p><span className="talent-social">@{person.talentHandle} ↗</span></div>
      </Link>)}
      {[0,1,2].map((i) => <div className="talent-card talent-card-placeholder" aria-hidden="true" key={`open-${i}`}><div className="talent-card-top"><span>{String(filtered.length+i+1).padStart(2,'0')}</span><span>OPEN / NORTHLINE</span></div><span className="talent-photo"/><div><h3>Coming Soon</h3><p>New talent joining the roster.</p></div></div>)}
    </div>
  </div>;
}

export type TalentSocials = Record<string, string>;

export type Talent = {
  talentHandle: string;
  name: string;
  bio: string;
  category: string;
  discipline: string;
  pfp: string;
  socials: TalentSocials;
};

export const seedTalent: Talent[] = [
  { talentHandle:'hxvacfn', name:'Hxvacfn', bio:'Competitive talent represented on the Northline roster.', category:'Talent', discipline:'Fortnite / Competitive', pfp:'/assets/hxvacfnpfp.jpg', socials:{x:'https://x.com/hxvacfn',youtube:'https://www.youtube.com/@HxvacfnFN',twitch:'https://www.twitch.tv/hxvac_'} },
  { talentHandle:'kingston', name:'Kingston', bio:'Competitive talent represented on the Northline roster.', category:'Talent', discipline:'Fortnite / Competitive', pfp:'/assets/kingstonfnpfp.jpg', socials:{x:'https://x.com/KingstonFN_',twitch:'https://www.twitch.tv/kingstonfn_'} },
  { talentHandle:'creep', name:'Creep', bio:'Competitive talent represented on the Northline roster.', category:'Talent', discipline:'Fortnite / Competitive', pfp:'/assets/creeppfp.jpg', socials:{x:'https://x.com/CreepWtff'} },
  { talentHandle:'joki', name:'Joki', bio:'Competitive talent represented on the Northline roster.', category:'Talent', discipline:'Fortnite / Competitive', pfp:'/assets/jokifnxpfp.jpg', socials:{x:'https://x.com/jokifnx'} },
  { talentHandle:'devade', name:'Devade', bio:'Competitive talent represented on the Northline roster.', category:'Talent', discipline:'Fortnite / Competitive', pfp:'/assets/devadefvpfp.jpg', socials:{x:'https://x.com/devadefv'} },
  { talentHandle:'drgxpb', name:'drgxpb', bio:'Creator talent represented on the Northline roster.', category:'Creator', discipline:'Creator / Digital', pfp:'', socials:{x:'https://x.com/drgxpb'} },
];

export const team = [
  { name:'Yeezy', role:'Founder', handle:'@irlyeezy', x:'https://x.com/irlyeezy', image:'/assets/yeezy-pfp.jpg' },
  { name:'Freaky', role:'Founder', handle:'@freakyy1x', x:'https://x.com/freakyy1x', image:'https://unavatar.io/twitter/freakyy1x' },
  { name:'Thorz', role:'Co-Founder', handle:'@ThorZMNG', x:'https://x.com/ThorZMNG', image:'https://unavatar.io/twitter/ThorZMNG' },
  { name:'7jayzen', role:'Owner', handle:'@7jayzen', x:'https://x.com/7jayzen', image:'https://unavatar.io/twitter/7jayzen' },
  { name:'Dexy1rs', role:'Owner', handle:'@Dexy1rs', x:'https://x.com/Dexy1rs', image:'https://unavatar.io/twitter/Dexy1rs' },
  { name:'ArticVisuals', role:'Owner', handle:'@ArticVisuals', x:'https://x.com/ArticVisuals', image:'https://unavatar.io/twitter/ArticVisuals' },
  { name:'w1llqt', role:'Owner', handle:'@w1llqt', x:'https://x.com/w1llqt', image:'https://unavatar.io/twitter/w1llqt' },
  { name:'hussainwyd', role:'Co-Owner', handle:'@hussainwyd', x:'https://x.com/hussainwyd', image:'https://unavatar.io/twitter/hussainwyd' },
  { name:'Reflectfn7', role:'Co-Owner', handle:'@Reflectfn7', x:'https://x.com/Reflectfn7', image:'https://unavatar.io/twitter/Reflectfn7' },
  { name:'janhadles', role:'Owner', handle:'@janhandles', x:'https://x.com/janhandles', image:'https://unavatar.io/twitter/janhandles' },
];

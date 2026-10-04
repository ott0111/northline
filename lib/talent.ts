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

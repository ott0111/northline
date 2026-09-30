
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

function updateHeader(){
  if(header) header.classList.toggle('scrolled', window.scrollY > 20);
}
updateHeader();
window.addEventListener('scroll', updateHeader, {passive:true});

if(menuToggle && mobileNav){
  const closeMenu = () => {
    menuToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open menu');
  };
  menuToggle.addEventListener('click', () => {
    const open = !mobileNav.classList.contains('open');
    menuToggle.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });
}

const revealEls = document.querySelectorAll('.reveal');
if(revealEls.length && 'IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); }
    });
  }, {threshold:0.12});
  revealEls.forEach(el => observer.observe(el));
} else { revealEls.forEach(el => el.classList.add('in')); }

const fastEls = document.querySelectorAll('.reveal-fast');
if(fastEls.length) fastEls.forEach((el, i) => setTimeout(() => el.classList.add('in'), 100 + i * 120));



// Copy-ready brand brief
const brandBrief = document.getElementById('brandBrief');
if(brandBrief){
  brandBrief.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(brandBrief).entries());
    const brief = [
      'NORTHLINE BRAND BRIEF','',
      'Company: ' + data.company,
      'Contact: ' + data.name,
      'Email: ' + data.email,
      'Campaign: ' + data.type,
      'Goal: ' + data.goal,
      'Budget: ' + (data.budget || 'Not provided'),
      'Timeline: ' + (data.timeline || 'Not provided'),
      'Talent / Category: ' + (data.talent || 'Open to recommendations')
    ].join('\n');
    document.getElementById('briefText').textContent = brief;
    document.getElementById('briefOutput').hidden = false;
    brandBrief.hidden = true;
  });
  document.getElementById('copyBrief')?.addEventListener('click', async () => {
    const textValue = document.getElementById('briefText')?.textContent || '';
    try{await navigator.clipboard.writeText(textValue)}catch{}
  });
}

// Copy-ready talent application
const talentApplication = document.getElementById('talentApplication');
if(talentApplication){
  talentApplication.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(talentApplication).entries());
    const brief = [
      'NORTHLINE TALENT APPLICATION','',
      'Type: ' + data.type,
      'Name / Alias: ' + data.name,
      'X / Primary Social: ' + data.social,
      'Game / Category: ' + data.category,
      'Region: ' + (data.region || 'Not provided'),
      'Primary Platform: ' + (data.platform || 'Not provided'),
      'Profile / Portfolio: ' + (data.portfolio || 'Not provided'),
      '',
      'What I do:', data.about,
      '',
      'Why Northline:', data.why
    ].join('\n');
    document.getElementById('preparedBrief').textContent = brief;
    document.getElementById('applicationSuccess').hidden = false;
    talentApplication.hidden = true;
  });
  document.getElementById('copyApplication')?.addEventListener('click', async () => {
    const textValue = document.getElementById('preparedBrief')?.textContent || '';
    try{await navigator.clipboard.writeText(textValue)}catch{}
  });
}

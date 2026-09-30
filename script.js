
const header = document.getElementById('siteHeader');

// Keep navigation state consistent across every page, including mobile navigation.
const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (!href || href.startsWith('http')) return;
  const page = href.split('#')[0].split('?')[0].toLowerCase();
  if (page === currentPage && page !== 'index.html') link.classList.add('active');
});
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
const briefError = document.getElementById('briefError');
if(brandBrief){
  brandBrief.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = brandBrief.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.innerHTML; submitButton.innerHTML = 'Sending <span>→</span>'; }
    const data = Object.fromEntries(new FormData(brandBrief).entries());
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({type:'brand-brief', data})
      });
      if (!response.ok) throw new Error('Submission failed');
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Submission failed');
    } catch (error) {
      if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = submitButton.dataset.originalText; }
      if (briefError) { briefError.textContent = error.message === 'Please complete all required fields.' || error.message === 'Please provide a valid email.' ? error.message : 'We could not send the brief right now. Please try again.'; briefError.hidden = false; }
      return;
    }
    const brief = [
      'NORTHLINE BRAND BRIEF','',
      'Company: ' + data.company,
      'Contact: ' + data.name,
      'Email: ' + data.email,
      'Partnership: ' + data.type,
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
  talentApplication.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = talentApplication.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.innerHTML; submitButton.innerHTML = 'Sending <span>→</span>'; }
    const data = Object.fromEntries(new FormData(talentApplication).entries());
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({type:'talent-application', data})
      });
      if (!response.ok) throw new Error('Submission failed');
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'Submission failed');
    } catch (error) {
      if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = submitButton.dataset.originalText; }
      const applicationError = document.getElementById('applicationError');
      if (applicationError) { applicationError.textContent = error.message === 'Please complete all required fields.' ? error.message : 'We could not send the application right now. Please try again.'; applicationError.hidden = false; }
      return;
    }
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

const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const button=contactForm.querySelector('button[type="submit"]');
    const original=button?.innerHTML;
    if(button){button.disabled=true;button.innerHTML='Sending <span>→</span>'}
    const data=Object.fromEntries(new FormData(contactForm).entries());
    try{
      const response=await fetch('/api/submissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'contact',data})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok) throw new Error(result.error||'Submission failed');
      contactForm.hidden=true;
      document.getElementById('contactSuccess').hidden=false;
    }catch(error){
      if(button){button.disabled=false;button.innerHTML=original}
      const contactError=document.getElementById('contactError');
      if(contactError){contactError.textContent=error.message==='Please complete all required fields.'||error.message==='Please provide a valid email.'?error.message:'We could not send your message right now. Please try again.';contactError.hidden=false;}
    }
  });
}

// Preselect contact intent from ?type=brand or ?type=talent links.
if (contactForm) {
  const requestedType = new URLSearchParams(window.location.search).get('type');
  const select = contactForm.querySelector('[name="type"]');
  if (select && requestedType) {
    const normalized = requestedType.toLowerCase();
    const match = Array.from(select.options).find(option => {
      const value = option.value.toLowerCase();
      return normalized === 'brand' ? value.includes('brand') : normalized === 'talent' ? value === 'talent' : value === normalized;
    });
    if (match) select.value = match.value;
  }
}


/* Smooth interaction layer */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  document.documentElement.classList.add('motion-ready');

  // Stagger grid/card reveals without touching existing reveal logic.
  document.querySelectorAll('.talent-grid,.home-talent-grid,.ops-home-grid,.latest-grid,.feature-grid,.approach-grid,.points-grid,.values-grid,.brand-services,.brand-mini-grid,.brand-process,.profile-standard,.price-grid,.discord-steps').forEach(grid=>{
    [...grid.children].forEach((el,i)=>el.style.setProperty('--stagger',Math.min(i,7)*55+'ms'));
  });

  // Lightweight cursor spotlight on interactive cards.
  const spotlightSelectors='.talent-card,.home-talent-card,.ops-home-card,.feature-card,.latest-grid>a,.brand-services>div,.brand-mini-grid>div,.brand-process>div,.profile-standard>div,.price-grid>div,.approach-grid>div,.points-grid>div,.values-grid>div';
  document.querySelectorAll(spotlightSelectors).forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
  });

  // Magnetic CTA/link movement, deliberately capped for a restrained feel.
  document.querySelectorAll('.btn,.text-link').forEach(el=>{
    if(el.closest('.mobile-nav')) return;
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-(r.left+r.width/2))/r.width;
      const y=(e.clientY-(r.top+r.height/2))/r.height;
      el.style.setProperty('--tx',(x*5).toFixed(2)+'px');
      el.style.setProperty('--ty',(y*4).toFixed(2)+'px');
    });
    el.addEventListener('pointerleave',()=>{
      el.style.setProperty('--tx','0px');
      el.style.setProperty('--ty','0px');
    });
  });

  // Subtle hero/profile parallax.
  const parallax=document.querySelectorAll('.hero-bg,.page-hero-bg,.profile-hero-bg,.hero-grid');
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=Math.min(window.scrollY,900);
      parallax.forEach((el,i)=>el.style.transform='translate3d(0,'+(y*(i===3?.018:.028))+'px,0)');
      ticking=false;
    });
  },{passive:true});
})();


/* Cinematic navigation + hero interactions */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  // Page entrance.
  requestAnimationFrame(()=>document.body.classList.add('page-ready'));

  // Smooth internal navigation overlay.
  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target==='_blank') return;
    const url=new URL(href,window.location.href);
    if(url.origin!==window.location.origin) return;
    link.addEventListener('click',e=>{
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
      if(url.pathname===window.location.pathname && url.hash) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(()=>{window.location.href=url.href},180);
    });
  });

  // Hero pointer depth. Very small movement keeps it premium.
  document.querySelectorAll('.hero,.page-hero,.profile-hero').forEach(hero=>{
    const layers=hero.querySelectorAll('.hero-bg,.page-hero-bg,.profile-hero-bg,.hero-grid,.profile-image');
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      layers.forEach((layer,i)=>{
        const amount=(i+1)*2;
        layer.style.setProperty('--px',(x*amount).toFixed(2)+'px');
        layer.style.setProperty('--py',(y*amount).toFixed(2)+'px');
      });
    });
    hero.addEventListener('pointerleave',()=>{
      layers.forEach(layer=>{layer.style.setProperty('--px','0px');layer.style.setProperty('--py','0px')});
    });
  });

  // Talent cards get a restrained 3D response.
  document.querySelectorAll('.home-talent-card,.ops-home-card,.talent-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(window.matchMedia('(hover:none)').matches) return;
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--rx',(y*-1.8).toFixed(2)+'deg');
      card.style.setProperty('--ry',(x*1.8).toFixed(2)+'deg');
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--ry','0deg');
    });
  });
})();

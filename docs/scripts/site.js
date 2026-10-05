/* Northline first-load screen */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('northlineLoaded') === 'true'; } catch {}

  if (seen) return;

  const loader = document.createElement('div');
  loader.id = 'nl-loader';
  loader.setAttribute('aria-label','Loading Northline');
  loader.innerHTML = '<div class="nl-loader-inner"><div class="nl-loader-top"><img src="./assets/logo-mark.png" alt="Northline"><span>NORTHLINE</span></div><div class="nl-loader-center"><span>01 / LOADING</span><strong>Talent. Representation.<br><em>Built to grow.</em></strong></div><div class="nl-loader-bottom"><div class="nl-loader-track"><i></i></div><div class="nl-loader-status"><span>Initializing</span><b>0%</b></div></div></div>';
  document.body.prepend(loader);

  const track = loader.querySelector('.nl-loader-track i');
  const status = loader.querySelector('.nl-loader-status b');
  const label = loader.querySelector('.nl-loader-status span');
  let progress = 0;
  let finished = false;

  const labels = [
    [0,'Initializing'],
    [25,'Loading interface'],
    [50,'Preparing roster'],
    [72,'Loading Northline'],
    [90,'Almost ready'],
    [100,'Ready']
  ];

  const render = value => {
    progress = Math.min(100, Math.max(progress, value));
    if(track) track.style.width = progress + '%';
    if(status) status.textContent = Math.round(progress) + '%';
    for(let i=labels.length-1;i>=0;i--){
      if(progress >= labels[i][0]){
        if(label) label.textContent = labels[i][1];
        break;
      }
    }
  };

  const finish = () => {
    if(finished) return;
    finished = true;
    render(100);
    try { sessionStorage.setItem('northlineLoaded','true'); } catch {}
    setTimeout(() => {
      loader.classList.add('is-done');
      setTimeout(() => loader.remove(), reduce ? 50 : 250);
    }, reduce ? 80 : 900);
  };

  const minimumVisible = reduce ? 150 : 450;
  const started = performance.now();
  const finishWhenReady = () => {
    const remaining = Math.max(0, minimumVisible - (performance.now() - started));
    setTimeout(finish, remaining);
  };

  const animate = now => {
    if(finished) return;
    const elapsed = now - started;
    const target = Math.min(94, 8 + elapsed / 115);
    render(target);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  // Never block the whole page behind every image/network request.
  // The old window.load dependency made image-heavy pages appear completely black.
  const startFinish = () => finishWhenReady();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startFinish, {once:true});
  else startFinish();

  // Hard safety cap so the loader can never trap the user on a black screen.
  setTimeout(finish, 1600);
})();
/* Reliable image fallback for mobile/network failures */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.classList.add('is-broken');
    img.removeAttribute('srcset');
    if (img.alt && !img.dataset.fallback) {
      img.dataset.fallback = 'true';
      const fallback = document.createElement('span');
      fallback.textContent = img.alt;
      fallback.setAttribute('aria-hidden','true');
      fallback.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;font-family:var(--display);font-weight:800;text-transform:uppercase;color:var(--grey);background:#101010;';
      const parent = img.parentElement;
      if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      if (parent) parent.appendChild(fallback);
    }
  }, {once:true});
});

window.addEventListener('pageshow', () => document.body.classList.remove('page-leaving'));
const header = document.getElementById('siteHeader');

// Keep navigation state consistent across every page, including mobile navigation.
const currentPage = ((window.location.pathname.split('/').pop() || 'index.html').toLowerCase().replace(/\.html$/, '') || 'index');
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (!href || href.startsWith('http')) return;
  const page = href.split('#')[0].split('?')[0].toLowerCase();
  const normalizedPage = page.replace(/^\//,'').replace(/\.html$/, '') || 'index'; if (normalizedPage === currentPage && currentPage !== 'index') link.classList.add('active');
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



/* Copy-ready brand brief */
const brandBrief = document.getElementById('brandBrief');
const briefError = document.getElementById('briefError');
if(brandBrief){
  brandBrief.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = brandBrief.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.innerHTML; submitButton.innerHTML = 'Sending <span><svg class="ui-icon ui-icon-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 7h8.17L7.59 4.41 9 3l5 5-5 5-1.41-1.41L10.17 9H2V7Z" fill="currentColor"/></svg></span>'; }
    const data = Object.fromEntries(new FormData(brandBrief).entries());
    try {
      const response = await fetch((window.NORTHLINE_API_ORIGIN || '') + '/api/submissions', {
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

/* Copy-ready talent application */
const talentApplication = document.getElementById('talentApplication');
if(talentApplication){
  talentApplication.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = talentApplication.querySelector('button[type="submit"]');
    if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.innerHTML; submitButton.innerHTML = 'Sending <span><svg class="ui-icon ui-icon-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 7h8.17L7.59 4.41 9 3l5 5-5 5-1.41-1.41L10.17 9H2V7Z" fill="currentColor"/></svg></span>'; }
    const data = Object.fromEntries(new FormData(talentApplication).entries());
    try {
      const response = await fetch((window.NORTHLINE_API_ORIGIN || '') + '/api/submissions', {
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
    if(button){button.disabled=true;button.innerHTML='Sending <span><svg class="ui-icon ui-icon-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 7h8.17L7.59 4.41 9 3l5 5-5 5-1.41-1.41L10.17 9H2V7Z" fill="currentColor"/></svg></span>'}
    const data=Object.fromEntries(new FormData(contactForm).entries());
    try{
      const response=await fetch((window.NORTHLINE_API_ORIGIN || '') + '/api/submissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'contact',data})});
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

/* Preselect contact intent from ?type=brand or ?type=talent links. */
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


/* Northline motion system */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('motion-ready');

  requestAnimationFrame(()=>document.body.classList.add('page-ready'));

  document.querySelectorAll('.talent-grid,.home-talent-grid,.ops-home-grid,.latest-grid,.feature-grid,.approach-grid,.points-grid,.values-grid,.brand-services,.brand-mini-grid,.brand-process,.profile-standard,.price-grid,.discord-steps').forEach(grid=>{
    [...grid.children].forEach((el,i)=>el.style.setProperty('--stagger',Math.min(i,7)*55+'ms'));
  });

  const header=document.getElementById('siteHeader');
  const setHeader=()=>header?.classList.toggle('scrolled',window.scrollY>24);
  const updateProgress=()=>document.documentElement.style.setProperty('--scroll-progress',((window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))*100).toFixed(2)+'%');
  setHeader();
  updateProgress();
  window.addEventListener('scroll',()=>{setHeader();updateProgress()},{passive:true});

  if(reduce) return;

  // Internal page transitions. Lightbox links are handled by the image viewer
  // below and must never be intercepted as normal page navigation.
  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('tel:')||link.target==='_blank'||link.hasAttribute('data-lightbox')) return;
    const url=new URL(href,window.location.href);
    if(url.origin!==window.location.origin) return;
    link.addEventListener('click',e=>{
      if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;
      if(url.pathname===window.location.pathname&&url.hash) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(()=>{window.location.href=url.href},180);
    });
  });

  document.querySelectorAll('.talent-card,.home-talent-card,.ops-home-card,.feature-card,.latest-grid>a,.brand-services>div,.brand-mini-grid>div,.brand-process>div,.profile-standard>div,.price-grid>div,.approach-grid>div,.points-grid>div,.values-grid>div').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(matchMedia('(hover:none)').matches) return;
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--mx',((x+.5)*100)+'%');
      card.style.setProperty('--my',((y+.5)*100)+'%');
      if(card.matches('.talent-card,.home-talent-card,.ops-home-card')){
        card.style.setProperty('--rx',(y*-1.4).toFixed(2)+'deg');
        card.style.setProperty('--ry',(x*1.4).toFixed(2)+'deg');
      }
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--ry','0deg');
    });
  });

  document.querySelectorAll('.btn,.text-link').forEach(el=>{
    if(el.closest('.mobile-nav')) return;
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--tx',(((e.clientX-(r.left+r.width/2))/r.width)*4).toFixed(2)+'px');
      el.style.setProperty('--ty',(((e.clientY-(r.top+r.height/2))/r.height)*3).toFixed(2)+'px');
    });
    el.addEventListener('pointerleave',()=>{
      el.style.setProperty('--tx','0px');
      el.style.setProperty('--ty','0px');
    });
  });

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

  const marquee=document.querySelector('.marquee');
  marquee?.addEventListener('mouseenter',()=>marquee.classList.add('marquee-fast'));
  marquee?.addEventListener('mouseleave',()=>marquee.classList.remove('marquee-fast'));
})();


/* Past work full-image viewer */
(function(){
  const items=document.querySelectorAll('[data-lightbox="work"]');
  if(!items.length)return;
  const box=document.createElement('div');
  box.className='nl-lightbox';
  box.setAttribute('aria-hidden','true');
  box.innerHTML='<button class="nl-lightbox-close" type="button" aria-label="Close image">×</button><img alt=""><div class="nl-lightbox-title"></div>';
  document.body.appendChild(box);
  const img=box.querySelector('img'), title=box.querySelector('.nl-lightbox-title');
  const close=()=>{
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    img.removeAttribute('src');
  };
  items.forEach(item=>item.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    img.src=item.href;
    img.alt=item.dataset.title||'';
    title.textContent=item.dataset.title||'';
    box.classList.add('is-open');
    box.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }));
  box.addEventListener('click',e=>{if(e.target===box)close();});
  box.querySelector('.nl-lightbox-close').addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    close();
  });
  img.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&box.classList.contains('is-open'))close();
  });
})();
 
/* Northline image handling */
(function(){
  document.querySelectorAll('img').forEach(img=>{
    if(!img.hasAttribute('loading')) img.loading='lazy';
    if(!img.hasAttribute('decoding')) img.decoding='async';
  });
})();
/* Northline roster filters */
(function(){
  const grid=document.getElementById('talentGrid');
  if(!grid)return;
  const cards=[...grid.querySelectorAll('.talent-card')];
  const filters=[...document.querySelectorAll('.talent-filter')];
  const search=document.getElementById('talentSearch');
  const empty=document.getElementById('talentNoResults');
  let active='all';
  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    let shown=0;
    cards.forEach(card=>{
      const text=card.textContent.toLowerCase();
      const cats=(card.dataset.category||'').toLowerCase();
      const matchFilter=active==='all'||cats.includes(active);
      const matchSearch=!q||text.includes(q);
      const show=matchFilter&&matchSearch;
      card.classList.toggle('is-hidden',!show);
      if(show)shown++;
    });
    if(empty)empty.hidden=shown!==0;
  };
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    active=btn.dataset.filter||'all';
    filters.forEach(b=>b.classList.toggle('active',b===btn));
    apply();
  }));
  search?.addEventListener('input',apply);
})();

/* Northline brand brief choices */
(function(){
  const choices=[...document.querySelectorAll('[data-brief-type]')];
  const select=document.getElementById('briefType');
  if(!choices.length||!select)return;
  const choose=value=>{
    [...select.options].forEach(o=>{if(o.value===value||o.text===value)select.value=o.value||o.text;});
    choices.forEach(c=>c.classList.toggle('is-selected',c.dataset.briefType===value));
  };
  choices.forEach(choice=>choice.addEventListener('click',()=>choose(choice.dataset.briefType)));
  const params=new URLSearchParams(location.search);
  const talent=params.get('talent');
  const talentInput=document.querySelector('[name="talent"]');
  if(talent&&talentInput)talentInput.value=talent;
  if(talent)choose('Talent Partnership');
})();

/* Small mobile-friendly back-to-top control */
(function(){
  const btn=document.createElement('button');
  btn.className='nl-back-top';
  btn.type='button';
  btn.setAttribute('aria-label','Back to top');
  btn.innerHTML='<svg class="ui-icon ui-icon-up" viewBox="0 0 16 16" aria-hidden="true"><path d="M7 14V5.83L4.41 8.41 3 7l5-5 5 5-1.41 1.41L9 5.83V14H7Z" fill="currentColor"/></svg>';
  document.body.appendChild(btn);
  const sync=()=>btn.classList.toggle('is-visible',window.scrollY>600);
  window.addEventListener('scroll',sync,{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  sync();
})();

/* Keep normal pages lightweight. Past Work controls its own gallery loading. */
document.querySelectorAll('img').forEach(img=>{
  if(!img.hasAttribute('loading')) img.loading='lazy';
  if(!img.hasAttribute('decoding')) img.decoding='async';
});


/* Northline shared footer */
(function(){
  const footer=document.querySelector('footer') || document.body.appendChild(document.createElement('footer'));
  footer.innerHTML='<div class="wrap"><div class="footer-main"><div><a href="./index.html" class="logo"><img src="./assets/logo-mark.png" alt="">Northline</a><p class="footer-tag">Talent / Partnerships / Management</p></div><div class="footer-links"><div><span>Explore</span><a href="./talent.html">Talent</a><a href="./services.html">Services</a><a href="./work.html">For Brands</a><a href="./contact.html">Contact</a></div><div><span>Legal</span><a href="./privacy.html">Privacy</a><a href="./terms.html">Terms</a><a href="./cookies.html">Cookies</a><a href="https://x.com/N0RTHLINE" target="_blank" rel="noopener noreferrer">X / @N0RTHLINE <svg class="ui-icon ui-icon-external" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h8v8h-2V6.41l-6.29 6.3-1.42-1.42-1.42 1.42L9.59 5H5V3Z" fill="currentColor"/></svg></a></div></div></div><div class="footer-bottom"><span>© 2026 Northline. All rights reserved.</span><span>Independent / Talent first.</span></div></div>';
})();

/* Northline first-load screen */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('northlineLoaded') === 'true'; } catch {}

  const navigation = performance.getEntriesByType('navigation')[0];
  const isHistoryRestore = navigation && navigation.type === 'back_forward';
  if (seen && !isHistoryRestore) return;

  const loader = document.createElement('div');
  loader.id = 'nl-loader';
  loader.setAttribute('aria-label','Loading Northline');
  loader.innerHTML = '<div class="nl-loader-grain" aria-hidden="true"></div><div class="nl-loader-inner"><div class="nl-loader-top"><span class="nl-loader-brandmark"><img src="./assets/logo-mark.png" alt=""></span><span>NORTHLINE</span><span class="nl-loader-top-note">TALENT / REPRESENTATION</span></div><div class="nl-loader-center"><div class="nl-loader-orbit" aria-hidden="true"><span></span><span></span><span></span><b>N</b></div><strong>Northline</strong><p>Independent talent agency</p></div><div class="nl-loader-bottom"><div class="nl-loader-progress-line"><span>PREPARING YOUR EXPERIENCE</span><b class="nl-loader-status-number">0%</b></div><div class="nl-loader-track"><i></i></div><div class="nl-loader-status"><span>Initializing</span><span class="nl-loader-status-right">NORTH AMERICA</span></div></div></div>'
  document.body.prepend(loader);

  const track = loader.querySelector('.nl-loader-track i');
  const status = loader.querySelector('.nl-loader-status-number');
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
      /* Keep the hidden loader in the DOM so a browser Back restore can replay it. */
    }, reduce ? 80 : 900);
  };

  const minimumVisible = reduce ? 700 : 1850;
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
  setTimeout(finish, 2250);
})();
/* Image errors are handled by the single Northline avatar fallback below. */
window.addEventListener('pageshow', event => {
  document.body.classList.remove('page-leaving');
  if(!event.persisted) return;
  const loader = document.getElementById('nl-loader');
  if(!loader) return;
  loader.classList.remove('is-done');
  const track = loader.querySelector('.nl-loader-track i');
  const status = loader.querySelector('.nl-loader-status-number');
  const label = loader.querySelector('.nl-loader-status span');
  if(track) track.style.width = '0%';
  if(status) status.textContent = '0%';
  if(label) label.textContent = 'Welcome back';
  setTimeout(() => {
    if(track) track.style.width = '100%';
    if(status) status.textContent = '100%';
    if(label) label.textContent = 'Ready';
    setTimeout(() => loader.classList.add('is-done'), 650);
  }, 1850);
});
// Clicking the brand mark always replays the intro when returning to the homepage.
document.querySelectorAll('#siteHeader .logo').forEach(link => link.addEventListener('click', () => {
  try { sessionStorage.removeItem('northlineLoaded'); } catch {}
}));
// Accessible click/tap behavior for the roster dropdown.
document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', event => {
    event.preventDefault();
    const dropdown = toggle.closest('.nav-dropdown');
    const open = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('click', event => {
  document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
    if(!dropdown.contains(event.target)) {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded','false');
    }
  });
});
document.addEventListener('keydown', event => {
  if(event.key === 'Escape') document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
    dropdown.classList.remove('open');
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded','false');
  });
});

// Mobile Roster submenu: keep Talent and Team grouped under one Roster control.
document.querySelectorAll('.mobile-roster-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const menuId = toggle.getAttribute('aria-controls');
    const submenu = menuId ? document.getElementById(menuId) : toggle.nextElementSibling;
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (submenu) submenu.classList.toggle('open', !expanded);
  });
});

const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

// Keep desktop and mobile navigation state in sync.
const currentPage = ((window.location.pathname.split('/').pop() || 'index.html').toLowerCase().replace(/\.html$/, '') || 'index');
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (!href || href.startsWith('http')) return;
  const page = href.split('#')[0].split('?')[0].toLowerCase();
  const normalizedPage = page.replace(/^\//, '').replace(/\.html$/, '') || 'index';
  if (normalizedPage === currentPage && currentPage !== 'index') {
    link.classList.add('active');
    if (link.closest('.mobile-nav')) link.setAttribute('aria-current', 'page');
  }
});

function updateHeader() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuToggle && mobileNav) {
  const closeMenu = (restoreFocus = false) => {
    menuToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => {
    const shouldOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.classList.toggle('open', shouldOpen);
    mobileNav.classList.toggle('open', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.setAttribute('aria-label', shouldOpen ? 'Close menu' : 'Open menu');
    if (shouldOpen) {
      const firstLink = mobileNav.querySelector('a:not(.btn)');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }
  });

  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu(true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMenu();
  }, { passive: true });
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
    if(img.classList.contains('work-thumb')){
      img.addEventListener('error',()=>{
        const full=img.dataset.fullSrc;
        if(full && img.src!==full){
          img.src=full;
          img.removeAttribute('srcset');
        }
      },{once:true});
    }
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


/* Northline horizontal gallery wheel + cookie consent preferences */
(function(){
  document.querySelectorAll('.work-gallery').forEach(gallery=>{gallery.addEventListener('wheel',event=>{if(gallery.scrollWidth<=gallery.clientWidth)return;if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){event.preventDefault();gallery.scrollLeft+=event.deltaY;}},{passive:false});});
  const consentName='northline_cookie_consent';
  const readConsent=()=>{const match=document.cookie.match(new RegExp('(?:^|; )'+consentName+'=([^;]*)'));if(!match)return null;try{return JSON.parse(decodeURIComponent(match[1]));}catch{return null;}};
  const saveConsent=analytics=>{const value=encodeURIComponent(JSON.stringify({essential:true,analytics:!!analytics,updatedAt:new Date().toISOString()}));document.cookie=consentName+'='+value+'; Max-Age=15552000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');banner.remove();manage.hidden=false;};
  const manage=document.createElement('button');manage.type='button';manage.className='nl-cookie-manage';manage.textContent='Cookie settings';manage.setAttribute('aria-label','Open cookie preferences');document.body.appendChild(manage);
  const banner=document.createElement('section');banner.className='nl-cookie-banner';banner.setAttribute('aria-label','Cookie preferences');
  banner.innerHTML='<div class="nl-cookie-copy"><span class="nl-cookie-eyebrow">YOUR PRIVACY / NORTHLINE</span><h2>Cookies, your choice.</h2><p>Essential storage keeps the site working. Optional analytics cookies stay off unless you choose them. <a href="./cookies.html">Read our cookie policy</a>.</p><div class="nl-cookie-options" hidden><label><input type="checkbox" checked disabled> Essential storage <small>Always on</small></label><label><input type="checkbox" data-analytics> Optional analytics <small>No analytics service is currently connected.</small></label></div></div><div class="nl-cookie-actions"><button type="button" data-cookie-accept>Accept all</button><button type="button" data-cookie-essential>Essential only</button><button type="button" class="nl-cookie-customize" data-cookie-customize>Customize</button><button type="button" data-cookie-save hidden>Save preferences</button></div>';
  document.body.appendChild(banner);
  const options=banner.querySelector('.nl-cookie-options'),analytics=banner.querySelector('[data-analytics]'),customize=banner.querySelector('[data-cookie-customize]'),save=banner.querySelector('[data-cookie-save]');
  const showBanner=()=>{banner.classList.add('is-visible');banner.querySelector('[data-cookie-accept]').focus({preventScroll:true});};
  const current=readConsent();if(current){banner.remove();manage.hidden=false;}else{manage.hidden=true;requestAnimationFrame(()=>banner.classList.add('is-visible'));}
  banner.querySelector('[data-cookie-accept]').addEventListener('click',()=>saveConsent(true));
  banner.querySelector('[data-cookie-essential]').addEventListener('click',()=>saveConsent(false));
  customize.addEventListener('click',()=>{options.hidden=false;analytics.checked=!!readConsent()?.analytics;customize.hidden=true;save.hidden=false;});
  save.addEventListener('click',()=>saveConsent(analytics.checked));
  manage.addEventListener('click',()=>{if(!banner.isConnected)document.body.appendChild(banner);options.hidden=false;analytics.checked=!!readConsent()?.analytics;customize.hidden=true;save.hidden=false;showBanner();});
})();


/* Reliable image fallback: remote avatar providers can fail, so never show a broken-image icon. */
(function(){
  function fallbackAvatar(img){
    if(img.dataset.nlFallbackApplied === 'true') return;
    img.dataset.nlFallbackApplied = 'true';
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    const name = (img.getAttribute('alt') || 'Northline').trim();
    const words = name.split(/\s+/).filter(Boolean);
    const initials = (words.length > 1
      ? words[0].charAt(0) + words[words.length - 1].charAt(0)
      : (words[0] || 'N').slice(0, 2)).toUpperCase();
    const safeInitials = initials.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#111111"/><rect x="18" y="18" width="284" height="284" rx="24" fill="none" stroke="#414141" stroke-width="2"/><path d="M42 250H278" stroke="#5a5a5a" stroke-width="2"/><text x="160" y="184" text-anchor="middle" font-family="Arial,sans-serif" font-size="86" font-weight="700" letter-spacing="-4" fill="#f2f2f2">' + safeInitials + '</text></svg>';
    img.onerror = null;
    img.classList.add('avatar-fallback');
    img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }
  function bindAvatar(img){
    if(img.dataset.nlFallbackBound === 'true') return;
    img.dataset.nlFallbackBound = 'true';
    img.addEventListener('error', function(){ fallbackAvatar(img); });
    if(img.complete && img.naturalWidth === 0) fallbackAvatar(img);
  }
  document.querySelectorAll('img').forEach(bindAvatar);
  // Catch images inserted later by galleries or shared page components.
  const observer = new MutationObserver(function(records){
    records.forEach(function(record){
      record.addedNodes.forEach(function(node){
        if(node.nodeType !== 1) return;
        if(node.matches && node.matches('img')) bindAvatar(node);
        if(node.querySelectorAll) node.querySelectorAll('img').forEach(bindAvatar);
      });
    });
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();

/* Subtle scroll-linked movement inspired by cinematic product reveals. */
(function(){
  const hero = document.querySelector('.hero');
  if(!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let queued = false;
  const update = function(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(function(){
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
      hero.style.setProperty('--nl-scroll-progress', progress.toFixed(3));
      const bg = hero.querySelector('.hero-bg');
      if(bg) bg.style.transform = 'translate3d(0,' + (progress * 7).toFixed(2) + '%,0) scale(' + (1.04 + progress * .025).toFixed(3) + ')';
      queued = false;
    });
  };
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

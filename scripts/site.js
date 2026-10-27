/* The branded loading screen is initialized early by scripts/loader.js. */

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
    if (window.innerWidth > 1240) closeMenu();
  }, { passive: true });
}

const revealEls = document.querySelectorAll('.reveal');
if(revealEls.length && 'IntersectionObserver' in window){
  try {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, {threshold:0.12});
    revealEls.forEach(el => observer.observe(el));
    // Enable hidden-until-revealed styling only after the observer is ready.
    document.documentElement.classList.add('js-motion');
  } catch {
    revealEls.forEach(el => el.classList.add('in'));
  }
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
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({type:'brand-brief', data})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'We could not submit the application. Please try again.');
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
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({type:'talent-application', data})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'We could not submit the application. Please try again.');
    } catch (error) {
      if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = submitButton.dataset.originalText; }
      const applicationError = document.getElementById('applicationError');
      if (applicationError) {
        const safeMessages = ['Please complete all required fields.', 'Please provide a valid email.', 'Too many submissions. Please try again later.', 'Storage is not configured yet.', 'Request is too large.', 'Invalid request.'];
        applicationError.textContent = safeMessages.includes(error.message) ? error.message : 'We could not send the application right now. Your details are still here. Please try again.';
        applicationError.hidden = false;
        applicationError.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'});
      }
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
    const successPanel = document.getElementById('applicationSuccess');
    successPanel.setAttribute('tabindex', '-1');
    successPanel.focus({preventScroll:true});
    successPanel.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  });
  document.getElementById('copyApplication')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    const textValue = document.getElementById('preparedBrief')?.textContent || '';
    let copied = false;
    try {
      await navigator.clipboard.writeText(textValue);
      copied = true;
    } catch {
      const area = document.createElement('textarea');
      area.value = textValue;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(area);
      area.select();
      copied = document.execCommand('copy');
      area.remove();
    }
    const original = button.dataset.originalText || button.innerHTML;
    button.dataset.originalText = original;
    button.textContent = copied ? 'Copied to clipboard' : 'Select and copy the brief above';
    if (copied) setTimeout(() => { if (button.isConnected) button.innerHTML = original; }, 2200);
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
      try{sessionStorage.setItem('nl_skip_next_loader','1');sessionStorage.setItem('nl_skip_next_cookie_prompt','1');}catch{}
      window.location.href=url.href;
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
  const count=document.getElementById('rosterCount');
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
    if(count)count.textContent=String(shown);
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


/* Northline cookie consent — one prompt until a choice is saved. */
(function(){
  document.querySelectorAll('.work-gallery').forEach(gallery=>{gallery.addEventListener('wheel',event=>{if(gallery.scrollWidth<=gallery.clientWidth)return;if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){event.preventDefault();gallery.scrollLeft+=event.deltaY;}},{passive:false});});
  const consentName='northline_cookie_consent';
  const readConsent=()=>{const match=document.cookie.match(new RegExp('(?:^|; )'+consentName+'=([^;]*)'));if(!match)return null;try{return JSON.parse(decodeURIComponent(match[1]));}catch{return null;}};
  const manage=document.createElement('button');
  manage.type='button';manage.className='nl-cookie-manage';manage.textContent='Cookie settings';manage.setAttribute('aria-label','Open cookie preferences');
  document.body.appendChild(manage);
  const banner=document.createElement('section');
  banner.className='nl-cookie-banner';banner.setAttribute('aria-label','Cookie preferences');banner.setAttribute('aria-live','polite');
  banner.innerHTML='<div class="nl-cookie-copy"><span class="nl-cookie-eyebrow">YOUR PRIVACY / NORTHLINE</span><h2>Cookie preferences</h2><p>Essential storage remembers your choice. Optional analytics are off by default. <a href="./cookies.html">Read our cookie policy</a>.</p><div class="nl-cookie-options" hidden><label><input type="checkbox" checked disabled> Essential storage <small>Always on</small></label><label><input type="checkbox" data-analytics> Optional analytics <small>No analytics service is currently connected.</small></label></div></div><div class="nl-cookie-actions"><button type="button" data-cookie-accept>Accept optional</button><button type="button" data-cookie-deny>Deny optional</button><button type="button" data-cookie-customize>Customize</button><button type="button" data-cookie-save hidden>Save choices</button></div>';
  document.body.appendChild(banner);
  const options=banner.querySelector('.nl-cookie-options'),analytics=banner.querySelector('[data-analytics]'),customize=banner.querySelector('[data-cookie-customize]'),save=banner.querySelector('[data-cookie-save]');
  const close=()=>{banner.classList.remove('is-visible');banner.setAttribute('aria-hidden','true');manage.hidden=false;};
  const saveConsent=allowAnalytics=>{
    const value=encodeURIComponent(JSON.stringify({essential:true,analytics:!!allowAnalytics,updatedAt:new Date().toISOString()}));
    document.cookie=consentName+'='+value+'; Max-Age=15552000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
    close();
  };
  const showBanner=()=>{
    banner.hidden=false;banner.removeAttribute('aria-hidden');
    requestAnimationFrame(()=>banner.classList.add('is-visible'));
  };
  const current=readConsent();
  let skipPrompt=false;
  try{skipPrompt=sessionStorage.getItem('nl_skip_next_cookie_prompt')==='1';sessionStorage.removeItem('nl_skip_next_cookie_prompt');}catch{}
  const navType=performance.getEntriesByType('navigation')[0]?.type;
  if(current){banner.remove();manage.hidden=false;}
  else if(skipPrompt&&navType!=='reload'){banner.remove();manage.hidden=true;}
  else{manage.hidden=true;banner.hidden=false;requestAnimationFrame(()=>banner.classList.add('is-visible'));}
  banner.querySelector('[data-cookie-accept]').addEventListener('click',()=>saveConsent(true));
  banner.querySelector('[data-cookie-deny]').addEventListener('click',()=>saveConsent(false));
  customize.addEventListener('click',()=>{options.hidden=false;analytics.checked=!!readConsent()?.analytics;customize.hidden=true;save.hidden=false;});
  save.addEventListener('click',()=>saveConsent(analytics.checked));
  manage.addEventListener('click',()=>{options.hidden=false;analytics.checked=!!readConsent()?.analytics;customize.hidden=true;save.hidden=false;showBanner();banner.querySelector('[data-cookie-save]').focus({preventScroll:true});});
})();

/* NORTHLINE 2026 / shared interaction polish */
(function(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path=window.location.pathname.replace(/\/+$/,'')||'/';
  const currentFile=path.split('/').pop()||'index.html';
  document.querySelectorAll('.primary-nav a[href],.mobile-nav a[href]').forEach(link=>{
    try{
      const url=new URL(link.getAttribute('href'),window.location.href);
      const target=url.pathname.replace(/\/+$/,'').split('/').pop()||'index.html';
      if(target===currentFile&&!url.hash){link.setAttribute('aria-current','page');link.classList.add('active');}
    }catch{}
  });
  const backTop=document.createElement('button');
  backTop.type='button';backTop.className='nl-back-top';backTop.setAttribute('aria-label','Back to top');
  backTop.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2 2.5 7.5l1.4 1.4L7 5.8V14h2V5.8l3.1 3.1 1.4-1.4L8 2Z" fill="currentColor"/></svg><span>Back to top</span>';
  document.body.appendChild(backTop);
  let queued=false;
  const update=()=>{backTop.classList.toggle('is-visible',window.scrollY>640);queued=false;};
  window.addEventListener('scroll',()=>{if(queued)return;queued=true;window.requestAnimationFrame(update);},{passive:true});
  update();
  backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));
  if(!reduceMotion&&'IntersectionObserver'in window){
    const targets=document.querySelectorAll('main section:not(.hero):not(.page-hero):not(.profile-hero) .section-heading,main section:not(.hero):not(.page-hero):not(.profile-hero) .section-number');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('nl-in-view');observer.unobserve(entry.target);
    }),{rootMargin:'0px 0px -8% 0px',threshold:.08});
    targets.forEach(target=>observer.observe(target));
  }
  if(!reduceMotion&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.btn,.nl-back-top').forEach(control=>{
      control.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;
        control.classList.remove('nl-ripple');void control.offsetWidth;control.classList.add('nl-ripple');
      });
      control.addEventListener('animationend',()=>control.classList.remove('nl-ripple'));
    });
  }
})();

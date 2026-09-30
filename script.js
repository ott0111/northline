
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

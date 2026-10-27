(function(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.createElement('div');
  loader.id='nl-loader';
  loader.className='nl-loader is-active';
  loader.setAttribute('role','status');
  loader.setAttribute('aria-live','polite');
  loader.setAttribute('aria-label','Loading Northline');
  loader.innerHTML='<div class="nl-loader-panel"><span class="nl-loader-mark" aria-hidden="true">N</span><div class="nl-loader-brand">NORTHLINE</div><div class="nl-loader-caption">TALENT / PARTNERSHIPS / MANAGEMENT</div><div class="nl-loader-track" aria-hidden="true"><span></span></div><div class="nl-loader-status">Preparing your experience</div></div>';
  const root=document.documentElement;
  let startedAt=performance.now(),finished=false,failSafe=null,hideTimer=null;
  root.classList.add('nl-loading');
  root.appendChild(loader);
  const status=loader.querySelector('.nl-loader-status');
  function hide(){
    if(finished)return;
    finished=true;
    if(failSafe)clearTimeout(failSafe);
    const wait=Math.max(0,reduceMotion?0:700-(performance.now()-startedAt));
    hideTimer=window.setTimeout(()=>{
      loader.classList.remove('is-active');
      root.classList.remove('nl-loading');
      window.setTimeout(()=>{if(loader.parentNode)loader.parentNode.removeChild(loader)},reduceMotion?0:360);
    },wait);
  }
  function show(){
    if(!loader.isConnected)root.appendChild(loader);
    if(hideTimer)clearTimeout(hideTimer);
    startedAt=performance.now();
    finished=false;
    root.classList.add('nl-loading');
    loader.classList.add('is-active');
    loader.removeAttribute('aria-hidden');
    if(status)status.textContent='Loading your next page';
    if(failSafe)clearTimeout(failSafe);
    failSafe=window.setTimeout(hide,9000);
  }
  function navigate(href){
    show();
    window.setTimeout(()=>{window.location.href=href},reduceMotion?0:220);
  }
  window.NorthlineLoader={show,hide,navigate};
  const loadSignal=new Promise(resolve=>{
    if(document.readyState==='complete')resolve();
    else window.addEventListener('load',resolve,{once:true});
  });
  const fontsReady=document.fonts&&document.fonts.ready?document.fonts.ready.catch(()=>{}):Promise.resolve();
  Promise.all([loadSignal,fontsReady]).then(()=>{
    if(status)status.textContent='Ready to explore';
    hide();
  });
  failSafe=window.setTimeout(()=>{
    if(status)status.textContent='Opening Northline';
    hide();
  },9000);
  window.addEventListener('pageshow',event=>{
    if(event.persisted){
      if(failSafe)clearTimeout(failSafe);
      if(hideTimer)clearTimeout(hideTimer);
      finished=false;
      hide();
    }
  });
})();
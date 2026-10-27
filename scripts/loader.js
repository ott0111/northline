(function(){
  const loader=document.createElement('div');
  loader.id='nl-loader';
  loader.className='nl-loader is-active';
  loader.setAttribute('role','status');
  loader.setAttribute('aria-live','polite');
  loader.setAttribute('aria-label','Loading Northline');
  loader.innerHTML='<div class="nl-loader-panel"><span class="nl-loader-mark" aria-hidden="true">N</span><div class="nl-loader-brand">NORTHLINE</div><div class="nl-loader-caption">TALENT / PARTNERSHIPS / MANAGEMENT</div><div class="nl-loader-track" aria-hidden="true"><span></span></div><div class="nl-loader-status">Preparing your experience</div></div>';
  const root=document.documentElement;
  let startedAt=performance.now();
  let finished=false;
  let failSafe=null;
  root.classList.add('nl-loading');
  root.appendChild(loader);
  function hide(){
    if(finished)return;
    finished=true;
    if(failSafe)clearTimeout(failSafe);
    const wait=Math.max(0,650-(performance.now()-startedAt));
    setTimeout(()=>{
      loader.classList.remove('is-active');
      root.classList.remove('nl-loading');
      setTimeout(()=>{if(loader.parentNode)loader.parentNode.removeChild(loader)},380);
    },wait);
  }
  function show(){
    startedAt=performance.now();
    finished=false;
    root.classList.add('nl-loading');
    loader.classList.add('is-active');
    if(failSafe)clearTimeout(failSafe);
    failSafe=setTimeout(hide,9000);
  }
  window.NorthlineLoader={show,hide};
  failSafe=setTimeout(hide,9000);
  window.addEventListener('load',hide,{once:true});
})();
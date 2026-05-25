// Set active nav based on current page
(function(){
  const savedLang = localStorage.getItem('mm_lang');
  if(savedLang) {
    document.body.className = 'lang-' + savedLang;
  }
  var page=(window.location.pathname.split('/').pop()||'index.html');
  var isWine=page.startsWith('wine-');
  document.addEventListener('DOMContentLoaded',function(){
    var s=document.getElementById('tnav-story'),w=document.getElementById('tnav-wines');
    if(s)s.classList.toggle('active',!isWine);
    if(w)w.classList.toggle('active',isWine);
  });
})();

/* First-visit logo overlay logic */
function initLogoOverlay() {
  if (sessionStorage.getItem('mm_visited_logo')) return;
  const overlay = document.createElement('div');
  overlay.id = 'logo-overlay';
  overlay.className = 'logo-overlay';
  overlay.innerHTML = `
    <div class="logo-slideshow">
      <div class="l-slide"></div>
      <div class="l-slide"></div>
      <div class="l-slide"></div>
      <div class="l-slide"></div>
    </div>
    <div class="logo-overlay-bg-dim"></div>
    <div class="logo-overlay-content">
      <img src="images/img-05.png" class="logo-overlay-img" alt="Max Mavrud">
      <div class="logo-lang-label">Choose Language / Zgjidhni Gjuhën</div>
      <div class="logo-overlay-choice">
        <button onclick="selectLangAndClose('en')">EN</button>
        <button onclick="selectLangAndClose('al')">AL</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Add class to trigger staggered animations for label and buttons after logo animation starts/completes
  const logoContent = overlay.querySelector('.logo-overlay-content');
  setTimeout(() => {
    logoContent.classList.add('show-elements');
  }, 400); // Trigger staggered entrance while logo is still settling for a smoother flow
}

window.selectLangAndClose = function(lang) {
  setLang(lang);
  sessionStorage.setItem('mm_visited_logo', '1');
  const el = document.getElementById('logo-overlay');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }
};

/* Inline photo gallery behavior */
(function(){
  var galleryImgs = [
    'images/img-01.jpg','images/img-02.jpg','images/img-03.jpg','images/img-04.jpg','images/img-06.jpg',
    'images/img-07.jpg','images/img-08.jpg','images/img-09.jpg','images/img-10.jpg','images/img-11.jpg',
    'images/img-12.jpg','images/img-13.jpg','images/img-14.jpg','images/img-15.jpg','images/img-16.jpg',
    'images/img-17.jpg','images/img-18.jpeg','images/img-19.jpeg'
  ];
  var galleryCaptions = [
    'Vineyard aerial view', 'Estate at golden hour', 'Winemaking detail', 'Cork detail', 'Grapes on vine',
    'Vineyard rows', 'Debine bottle', 'Cellar scene', 'Tasting table', 'Harvest scene',
    'Vineyard detail', 'Winery architecture', 'Wine tasting set', 'Hand harvest', 'Barrel room',
    'Estate panorama', 'Wine cellar interior', 'Vineyard landscape'
  ];
  var lb, glImg, glCaption, glSpinner;
  function openLightbox(idx){
    lb = document.getElementById('gallery-lightbox');
    if(!lb) return;
    glImg = document.getElementById('gl-img');
    glCaption = document.getElementById('gl-caption');
    glSpinner = document.getElementById('gl-spinner');
    lb.dataset.index = idx;
    var imgSrc = galleryImgs[idx] || '';
    glImg.src = '';
    glSpinner.style.display = 'flex';
    var img = new Image();
    img.onload = function(){
      glImg.src = imgSrc;
      glSpinner.style.display = 'none';
    };
    img.onerror = function(){
      glSpinner.style.display = 'none';
    };
    img.src = imgSrc;
    glCaption.textContent = galleryCaptions[idx] || '';
    lb.classList.add('open');
  }
  function closeLightbox(){
    var el = document.getElementById('gallery-lightbox');
    if(!el) return; el.classList.remove('open');
  }
  function move(delta){
    var el = document.getElementById('gallery-lightbox'); if(!el || typeof el.dataset.index === 'undefined') return;
    var i = parseInt(el.dataset.index,10);
    if(isNaN(i)) i = 0;
    i = (i + delta + galleryImgs.length) % galleryImgs.length; openLightbox(i);
  }
  document.addEventListener('DOMContentLoaded', function(){
    // Only initialize gallery when the gallery section exists on the page
    var gallerySection = document.getElementById('photo-gallery');
    if(!gallerySection) return;

    var thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach(function(btn){ btn.addEventListener('click', function(){ openLightbox(parseInt(btn.dataset.index,10) || 0); }); });

    // gallery toggle behaviour
    var toggleBtn = document.getElementById('gallery-toggle');
    function updateToggleLabel(){
      if(!toggleBtn || !gallerySection) return;
      var open = !gallerySection.classList.contains('collapsed');
      toggleBtn.setAttribute('aria-expanded', String(open));
      var en = toggleBtn.querySelector('.ml-en');
      var al = toggleBtn.querySelector('.ml-al');
      if(open){ if(en) en.textContent = 'Close Gallery'; if(al) al.textContent = 'Mbyll Galerinë'; }
      else    { if(en) en.textContent = 'Open Gallery';  if(al) al.textContent = 'Hap Galerinë'; }
    }
    if(gallerySection && toggleBtn){
      // start collapsed
      gallerySection.classList.add('collapsed');
      updateToggleLabel();
      toggleBtn.addEventListener('click', function(){
        gallerySection.classList.toggle('collapsed');
        updateToggleLabel();
      });
    }

    // create lightbox markup once (if not present)
    if(!document.getElementById('gallery-lightbox')){
      var container = document.createElement('div'); container.id = 'gallery-lightbox'; container.className = 'gallery-lightbox';
      container.innerHTML = '<div class="gl-inner">\n<button class="gl-close" id="gl-close">×</button>\n<div id="gl-spinner" class="gl-spinner"><div class="spinner"></div></div>\n<img id="gl-img" class="gl-img" src="" alt="">\n<div class="gl-caption" id="gl-caption"></div>\n<button id="gl-prev" class="gl-prev">‹</button>\n<button id="gl-next" class="gl-next">›</button>\n</div>';
      document.body.appendChild(container);
    }

    document.getElementById('gl-close').addEventListener('click', closeLightbox);
    document.getElementById('gl-prev').addEventListener('click', function(e){ e.stopPropagation(); move(-1); });
    document.getElementById('gl-next').addEventListener('click', function(e){ e.stopPropagation(); move(1); });
    document.getElementById('gallery-lightbox').addEventListener('click', function(e){ if(e.target.id==='gallery-lightbox') closeLightbox(); });
    document.addEventListener('keydown', function(e){ if(!document.getElementById('gallery-lightbox').classList.contains('open')) return; if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowLeft') move(-1); if(e.key==='ArrowRight') move(1); });
  });
})();
// ── Top nav ──
function toggleWinesMenu() {
  const dd = document.getElementById('wines-dropdown');
  const bd = document.getElementById('wd-backdrop');
  const arrow = document.getElementById('tnav-arrow');
  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    dd.classList.remove('open');
    bd.classList.remove('open');
    arrow.classList.remove('open');
  } else {
    dd.classList.add('open');
    bd.classList.add('open');
    arrow.classList.add('open');
  }
}
function closeWinesMenu() {
  document.getElementById('wines-dropdown').classList.remove('open');
  document.getElementById('wd-backdrop').classList.remove('open');
  const arrow = document.getElementById('tnav-arrow');
  if (arrow) arrow.classList.remove('open');
}
function navToWine(id) {
  try{
    console.log('navToWine ->', id);
    closeWinesMenu();
    showPage(id, null);
    // Mark wines btn as active
    document.querySelectorAll('.tnav-btn').forEach(b => b.classList.remove('active'));
    const wbtn = document.getElementById('tnav-wines'); if (wbtn) wbtn.classList.add('active');
  }catch(e){
    console.error('navToWine error', e);
  }
}
function setActiveNav(which) {
  closeWinesMenu();
  document.querySelectorAll('.tnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tnav-' + which).classList.add('active');
}

// ── Reviews ──
const reviews={bardhe:[],rose:[],trio:[],neuron:[]};
let serverAvailable=false;
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function starsHTML(r){let s='';for(let i=1;i<=5;i++)s+=i<=Math.round(r)?'★':'☆';return s}

function loadSaved(){
  Object.keys(reviews).forEach(wine=>{
    try{
      const saved=localStorage.getItem('mmr_'+wine);
      if(saved){reviews[wine]=JSON.parse(saved);}
    }catch(e){}
  });
}

function hasVoted(wine){
  try{return localStorage.getItem('mmv_'+wine)==='1';}catch(e){return false;}
}
function markVoted(wine){
  try{localStorage.setItem('mmv_'+wine,'1');}catch(e){}
}

async function fetchRatings(){
  try{
    const res = await fetch('/api/reviews');
    if(!res.ok) throw new Error('failed');
    const json = await res.json();
    Object.keys(reviews).forEach(wine=>{
      reviews[wine] = Array.isArray(json[wine]) ? json[wine] : [];
    });
    serverAvailable = true;
  }catch(e){
    serverAvailable = false;
    loadSaved();
  }
  Object.keys(reviews).forEach(renderWine);
}

function renderWine(wine){
  const list=reviews[wine];
  const lang=document.body.classList.contains('lang-al')?'al':'en';

  // Score badge in hero
  const heroEl=document.getElementById(wine+'-hero-rating');
  if(heroEl){
    if(!list.length){
      heroEl.innerHTML='';
    } else {
      const avg=list.reduce((a,r)=>a+r.stars,0)/list.length;
      const pct=Math.round(avg/5*100);
      heroEl.innerHTML=`<div class="wine-score-badge"><span class="wsb-stars">${starsHTML(avg)}</span><span class="wsb-pct">${pct}%</span><span class="wsb-count">(${list.length})</span></div>`;
    }
  }

  // Summary above form
  const summEl=document.getElementById(wine+'-summary');
  if(summEl){
    if(!list.length){
      summEl.innerHTML='';
    } else {
      const avg=list.reduce((a,r)=>a+r.stars,0)/list.length;
      const pct=Math.round(avg/5*100);
      summEl.innerHTML=`<div class="rating-summary"><div><div class="rating-big-num">${avg.toFixed(1)}</div><div class="rating-stars-display">${starsHTML(avg)}</div><div class="rating-total-count">${list.length} ${lang==='al'?'vlerësime':'rating'+(list.length!==1?'s':'')}</div></div><div style="font-family:'Cormorant Garamond',serif;font-size:clamp(36px,9vw,64px);font-weight:300;color:var(--gold);line-height:1">${pct}%</div></div>`;
    }
  }

  // Form: hide if already voted
  const formEl=document.getElementById(wine+'-form');
  if(formEl){
    if(hasVoted(wine)){
      formEl.innerHTML=`<div class="voted-msg"><span class="voted-check">✓</span><div class="voted-text">${lang==='al'?'Faleminderit për vlerësimin tuaj!':'Thank you for rating!'}</div><div class="voted-sub">${lang==='al'?'Keni votuar tashmë për këtë verë.':'You\'ve already rated this wine.'}</div></div>`;
    }
  }
}

async function submitReview(wine){
  const lang=document.body.classList.contains('lang-al')?'al':'en';
  if(hasVoted(wine)){
    const formEl=document.getElementById(wine+'-form');
    if(formEl) formEl.innerHTML=`<div class="voted-msg"><span class="voted-check">✓</span><div class="voted-text">${lang==='al'?'Keni votuar tashmë.':'Already rated.'}</div></div>`;
    return;
  }
  const rInput=document.querySelector(`input[name="${wine}-r"]:checked`);
  if(!rInput){alert(lang==='al'?'Ju lutem zgjidhni yje.':'Please select a star rating.');return;}
  const stars = parseInt(rInput.value, 10);
  reviews[wine].push({stars});
  try {
    if(serverAvailable){
      await fetch('/api/reviews', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({wine, stars})
      });
    } else {
      throw new Error('server unavailable');
    }
  } catch(e) {
    try{localStorage.setItem('mmr_'+wine,JSON.stringify(reviews[wine]));}catch(err){}
  }
  markVoted(wine);
  renderWine(wine);
}

// ── Lang ──
function setLang(lang){
  document.body.className='lang-'+lang;
  localStorage.setItem('mm_lang', lang);
  document.getElementById('btn-en').classList.toggle('active',lang==='en');
  document.getElementById('btn-al').classList.toggle('active',lang==='al');
  Object.keys(reviews).forEach(renderWine);
}

// ── Drawer ──
function openDrawer(){const d=document.getElementById('drawer'),o=document.getElementById('drawer-overlay');if(d)d.classList.add('open');if(o)o.classList.add('open')}
function closeDrawer(){const d=document.getElementById('drawer'),o=document.getElementById('drawer-overlay');if(d)d.classList.remove('open');if(o)o.classList.remove('open')}

// ── Nav ──
function showPage(id,el){
  try{
    console.log('showPage ->', id);
    var pageMap={'home':'index.html','wine-bardhe':'wine-bardhe.html','wine-rose':'wine-rose.html','wine-trio':'wine-trio.html','wine-neuron':'wine-neuron.html'};
    var t=pageMap[id];
    if(t){
      // use assign to ensure a proper navigation and history entry
      window.location.assign(t);
    } else {
      console.warn('showPage: unknown id', id);
    }
  }catch(e){
    console.error('showPage error', e);
  }finally{
    closeDrawer();
  }
}

// ── Back to top + Topbar hide ──
document.addEventListener('DOMContentLoaded',()=>{
  const scroll  = document.getElementById('main-scroll');
  const btn     = document.getElementById('btt');
  const topbar  = document.querySelector('.topbar');

  let lastY = 0, ticking = false;
  // Ensure we start at the top of the main scroll area when a page loads
  if(scroll){
    try{ scroll.scrollTo({top:0}); }catch(e){}
  }

  if(scroll && btn){
    btn.addEventListener('click',()=>scroll.scrollTo({top:0,behavior:'smooth'}));

    scroll.addEventListener('scroll',()=>{
      if(!ticking){
        requestAnimationFrame(()=>{
          const y = scroll.scrollTop;

          // Back-to-top visibility
          btn.classList.toggle('visible', y > 300);

          // Topbar hide / show — only react if scrolled more than 8px to avoid jitter
          if(topbar){
            const delta = y - lastY;
            if(delta > 8 && y > 80){
              topbar.classList.add('topbar-hidden');
              scroll.classList.add('topbar-gone');
            } else if(delta < -8 || y < 80){
              topbar.classList.remove('topbar-hidden');
              scroll.classList.remove('topbar-gone');
            }
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // More reliable rating rendering (prevents empty badges on some devices)
  fetchRatings().then(function(){
    Object.keys(reviews).forEach(renderWine);
  }).catch(function(){
    // if fetch fails, localStorage fallback is handled inside fetchRatings();
    // still re-render after a tick so DOM is settled.
    setTimeout(function(){ Object.keys(reviews).forEach(renderWine); }, 0);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const pc = document.getElementById('photo-cork');
  const pe = document.getElementById('photo-estate2');
  if(pc) pc.style.backgroundImage = "url('images/img-04.jpg')";
  if(pe) pe.style.backgroundImage = "url('images/img-07.jpg')";

  // Smoothly reveal the active page
  const activePage = document.querySelector('.page.active');
  if(activePage) {
    requestAnimationFrame(() => activePage.classList.add('visible'));
  }

  initLogoOverlay();
  initTastingWheels();
});

function initTastingWheels() {
  const wheels = document.querySelectorAll('.tasting-wheel');
  wheels.forEach(container => {
    const values = JSON.parse(container.dataset.values); // e.g. [80, 90, 70, 60, 85]
    const labelsEn = JSON.parse(container.dataset.labelsEn);
    const labelsAl = JSON.parse(container.dataset.labelsAl);
    
    const center = 100;
    const radius = 85; // Increased radius even more to make the wheel more prominent
    const total = values.length;
    
    // Tightened viewBox top padding to reduce gap with heading
    let svgHtml = `<svg viewBox="-50 -15 300 230" class="wheel-svg">`;
    
    // Draw grid (concentric shapes)
    for(let i=1; i<=4; i++) {
      let points = [];
      let r = (radius / 4) * i;
      for(let j=0; j<total; j++) {
        let angle = (j / total) * 2 * Math.PI - Math.PI / 2;
        points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
      }
      svgHtml += `<polygon points="${points.join(' ')}" class="wheel-grid"></polygon>`;
    }

    // Draw axes and labels
    for(let j=0; j<total; j++) {
      let angle = (j / total) * 2 * Math.PI - Math.PI / 2;
      let x = center + radius * Math.cos(angle);
      let y = center + radius * Math.sin(angle);
      svgHtml += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" class="wheel-axis"></line>`;
      
      // Labels placed with enough padding to prevent clipping
      let lx = center + (radius + 25) * Math.cos(angle);
      let ly = center + (radius + 20) * Math.sin(angle);
      
      let anchor = 'middle';
      let cos = Math.cos(angle);
      if (cos > 0.2) anchor = 'start';
      else if (cos < -0.2) anchor = 'end';

      svgHtml += `
        <text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" class="wheel-label">
          <tspan class="ml-en">${labelsEn[j]}</tspan>
          <tspan class="ml-al">${labelsAl[j]}</tspan>
        </text>`;
    }

    // Draw the wine data area
    let dataPoints = [];
    for(let j=0; j<total; j++) {
      let angle = (j / total) * 2 * Math.PI - Math.PI / 2;
      let r = (values[j] / 100) * radius;
      dataPoints.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
    }
    svgHtml += `<polygon points="${dataPoints.join(' ')}" class="wheel-area"></polygon>`;
    svgHtml += `</svg>`;
    
    container.innerHTML = svgHtml;
  });
}

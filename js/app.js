// Simple verse app with animations and interactivity (with translations)
const verses = [
  {ref:'John 3:16', text:{
    KJV:'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    EN:'God loved the world and gave his Son so that everyone who believes in him will have eternal life.',
    TL:'Mahal ng Diyos ang mundo kaya ibinigay niya ang kanyang Anak, upang ang maniwala ay magkaroon ng buhay na walang hanggan.',
    ES:'Dios amó al mundo y entregó a su Hijo para que todo el que cree en él tenga vida eterna.'
  }},
  {ref:'Psalm 23:1', text:{
    KJV:'The LORD is my shepherd; I shall not want.',
    EN:'The Lord is my shepherd; I lack nothing.',
    TL:'Ang Panginoon ang aking pastol; hindi ako magkukulang.',
    ES:'El Señor es mi pastor; nada me faltará.'
  }},
  {ref:'Romans 8:28', text:{
    KJV:'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    EN:'We know that God causes everything to work together for good for those who love him and are called according to his purpose.',
    TL:'Alam namin na ang lahat ng bagay ay gumagana para sa kabutihan para sa mga nagmamahal sa Diyos, ayon sa kanyang layunin.',
    ES:'Sabemos que Dios dispone todas las cosas para bien de los que le aman, conforme a su propósito.'
  }},
  {ref:'Philippians 4:13', text:{
    KJV:'I can do all things through Christ which strengtheneth me.',
    EN:'I can do all things through Christ who strengthens me.',
    TL:'Lahat ng bagay ay kaya kong gawin sa pamamagitan ni Cristo na nagpapalakas sa akin.',
    ES:'Todo lo puedo en Cristo que me fortalece.'
  }},
  {ref:'Proverbs 3:5', text:{
    KJV:'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
    EN:'Trust in the Lord with all your heart and lean not on your own understanding.',
    TL:'Magtiwala ka sa Panginoon nang buong puso at huwag kang umasa sa sarili mong pang-unawa.',
    ES:'Confía en el Señor con todo tu corazón y no te apoyes en tu propia prudencia.'
  }}
];

let idx = 0;
const verseText = document.getElementById('verse-text');
const verseRef = document.getElementById('verse-ref');
const randomBtn = document.getElementById('random-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');
const translateSelect = document.getElementById('translate');

// header search (separate input in header) and dropdown will be handled if present on page
const headerSearch = document.getElementById('header-search');
const footerVersion = document.getElementById('footer-version');

function updateFooterVersion(){
  if(!footerVersion) return;
  let text = 'KJV';
  if(translateSelect && translateSelect.options && translateSelect.selectedIndex >= 0){
    text = translateSelect.options[translateSelect.selectedIndex].text || translateSelect.value;
  } else if(translateSelect && translateSelect.value){
    text = translateSelect.value;
  }
  footerVersion.textContent = text;
}

// load preferred translation
const savedTrans = localStorage.getItem('dv_trans');
if(savedTrans) translateSelect.value = savedTrans;

function getText(v){
  const key = translateSelect.value || 'KJV';
  return (v.text && v.text[key]) ? v.text[key] : (v.text && v.text['KJV']) || '';
}


function showToast(msg){
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toast.classList.remove('show'),1500);
}

function setIndex(i){
  idx = (i + verses.length) % verses.length;
  render();
  location.hash = `#v=${idx}`;
}

function render(){
  const v = verses[idx];
  verseRef.textContent = v.ref + (translateSelect.value && translateSelect.value !== 'KJV' ? ` — ${translateSelect.options[translateSelect.selectedIndex].text}` : '');
  typeWrite(getText(v));
}

function typeWrite(str){
  // split into words and reveal each word with spacing for readability
  verseText.innerHTML = '';
  const wrapper = document.createElement('span'); wrapper.className='reveal';
  const words = String(str).split(' ');
  words.forEach((w,i)=>{
    const s = document.createElement('span');
    s.className = 'word';
    s.textContent = w;
    s.style.transition = `opacity .22s ease ${i*120}ms, transform .22s ease ${i*120}ms`;
    wrapper.appendChild(s);
    // add an actual space so copying preserves spacing
    if(i < words.length - 1) wrapper.appendChild(document.createTextNode(' '));
  });
  verseText.appendChild(wrapper);
  // reveal after layout
  requestAnimationFrame(()=>{
    wrapper.querySelectorAll('.word').forEach(sp=>{sp.style.opacity=1;sp.style.transform='translateY(0)'});
  });
}

function randomVerse(){setIndex(Math.floor(Math.random()*verses.length));}
function next(){setIndex(idx+1);} 
function prev(){setIndex(idx-1);} 

randomBtn.addEventListener('click', randomVerse);
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
copyBtn.addEventListener('click', ()=>{
  const text = `${getText(verses[idx])} — ${verses[idx].ref}`;
  navigator.clipboard.writeText(text).then(()=>showToast('Copied to clipboard'));
});
shareBtn.addEventListener('click', ()=>{
  const url = location.origin + location.pathname + `#v=${idx}&t=${translateSelect.value || 'KJV'}`;
  navigator.clipboard.writeText(url).then(()=>showToast('Share link copied'));
});

translateSelect.addEventListener('change', ()=>{ localStorage.setItem('dv_trans', translateSelect.value); render(); updateFooterVersion(); });

searchInput.addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){setIndex(0);return}
  const found = verses.findIndex(v=>{
    if(v.ref.toLowerCase().includes(q)) return true;
    return Object.values(v.text).some(txt=> txt.toLowerCase().includes(q));
  });
  if(found>=0) setIndex(found);
});

// keyboard navigation
window.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') next();
  if(e.key === 'ArrowLeft') prev();
  if(e.key === ' ') { e.preventDefault(); randomVerse(); }
});

// initialize from hash or random
(function init(){
  const m = location.hash.match(/v=(\d+)/);
  const t = location.hash.match(/t=([A-Za-z_\-]+)/);
  const q = location.hash.match(/q=([^&]+)/);
  if(m) idx = Number(m[1])%verses.length;
  if(t && t[1]){ translateSelect.value = t[1]; localStorage.setItem('dv_trans', t[1]); }
  if(q && q[1]){
    const val = decodeURIComponent(q[1]);
    if(searchInput){ searchInput.value = val; searchInput.dispatchEvent(new Event('input')); }
    if(headerSearch) headerSearch.value = val;
  }
  render();
  updateFooterVersion();
})();

// Respect reduced motion for typing
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const originalTypeWrite = typeWrite;
if(prefersReducedMotion){
  typeWrite = function(str){ verseText.textContent = str; };
}

// wire header search: Enter triggers site search (uses page search if available)
if(headerSearch){
  headerSearch.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const qv = headerSearch.value.trim(); if(!qv) return;
      if(searchInput){ searchInput.value = qv; searchInput.dispatchEvent(new Event('input')); location.hash = `q=${encodeURIComponent(qv)}`; }
      else { location.href = 'index.html#q=' + encodeURIComponent(qv); }
    }
  });
}

// dropdown toggle behavior
const navDropdown = document.querySelector('.nav-dropdown');
if(navDropdown){
  const toggle = navDropdown.querySelector('.dropdown-toggle');
  const menu = navDropdown.querySelector('.dropdown-menu');
  if(toggle){
    toggle.addEventListener('click', (e)=>{ e.stopPropagation(); const open = navDropdown.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
    document.addEventListener('click', (e)=>{ if(!navDropdown.contains(e.target)){ navDropdown.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });
    if(menu){
      menu.addEventListener('click', (e)=>{
        const a = e.target.closest('a'); if(!a) return; e.preventDefault(); const t = a.dataset.testament;
        if(t){
          // open local modal with book list (if present), otherwise navigate to verse page with param
          if(typeof openTestamentModal === 'function') { openTestamentModal(t); }
          else { location.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + 'verse.html#testament=' + t; }
        }
      });
    }

    // -- Testament modal rendering and behavior
    const TESTAMENTS = {
      old: [
        'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
      ],
      new: [
        'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
      ]
    };

    function openTestamentModal(which){
      const mod = document.getElementById('testament-modal'); const grid = document.getElementById('testament-grid'); const title = document.getElementById('testament-title'); const desc = document.getElementById('testament-desc');
      if(!mod || !grid) { location.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + 'verse.html#testament=' + which; return; }
      grid.innerHTML = '';
      const books = TESTAMENTS[which] || [];
      books.forEach(b=>{
        const item = document.createElement('div'); item.className = 'book-item'; item.innerHTML = `<a href="pages/verse.html#book=${encodeURIComponent(b)}">${b}</a>`;
        item.addEventListener('click', ()=>{ location.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + 'pages/verse.html#book=' + encodeURIComponent(b); });
        grid.appendChild(item);
      });
      title.textContent = which === 'old' ? 'Old Testament Books' : 'New Testament Books';
      if(desc) desc.textContent = which === 'old' ? 'List of the 39 Old Testament books.' : 'List of the 27 New Testament books.';

      // update control buttons state & accessibility
      const bOld = document.getElementById('btn-old');
      const bNew = document.getElementById('btn-new');
      if(bOld){
        bOld.classList.toggle('active', which === 'old');
        bOld.setAttribute('aria-pressed', which === 'old');
        bOld.setAttribute('aria-controls','testament-content');
        bOld.onclick = ()=>{ if(which !== 'old') openTestamentModal('old'); };
      }
      if(bNew){
        bNew.classList.toggle('active', which === 'new');
        bNew.setAttribute('aria-pressed', which === 'new');
        bNew.setAttribute('aria-controls','testament-content');
        bNew.onclick = ()=>{ if(which !== 'new') openTestamentModal('new'); };
      }

      // open modal
      mod.setAttribute('aria-hidden','false'); mod.classList.add('open'); document.body.style.overflow='hidden';
      // focus active button for immediate keyboard navigation
      const focusBtn = (which === 'old' ? bOld : bNew) || mod.querySelector('.modal-close');
      if(focusBtn) focusBtn.focus();
      // wire close
      mod.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', ()=>{ mod.setAttribute('aria-hidden','true'); mod.classList.remove('open'); document.body.style.overflow=''; }));
    }

    // If the page has a testament modal (pages/verse.html), open it if hash present
    if(location.hash && location.hash.includes('testament=')){
      const t = location.hash.split('testament=')[1].split('&')[0]; if(t && document.getElementById('testament-modal')) openTestamentModal(t);
    }
  }
}

// Interactive particle background
(function particleBG(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = innerWidth, H = innerHeight;
  function resizeCanvas(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * DPR);
    canvas.height = Math.round(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    W = innerWidth; H = innerHeight;
  }
  resizeCanvas();

  const colors = ['#FFC857','#7C3AED','#06B6D4'];
  let particles = [];
  let count = 0;
  function computeCount(){
    let base = Math.floor((W*H)/(120000));
    if(W < 420) base = Math.floor(base/2);
    return Math.max(10, base);
  }
  function rand(min,max){ return Math.random()*(max-min)+min; }
  function initParticles(){
    particles = [];
    count = computeCount();
    const scale = 1 / Math.max(1, DPR);
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*W,
        y: Math.random()*H,
        vx: rand(-0.35,0.35),
        vy: rand(-0.35,0.35),
        r: (rand(0.9,2.8) + Math.random()) * scale,
        c: colors[i%colors.length],
      });
    }
  }
  let mouse = {x:-9999,y:-9999,down:false};
  window.addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('touchmove', (e)=>{ const t = e.touches[0]; if(t){ mouse.x=t.clientX; mouse.y=t.clientY; }} , {passive:true});
  window.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });
  window.addEventListener('mousedown', ()=>mouse.down=true);
  window.addEventListener('mouseup', ()=>mouse.down=false);
  window.addEventListener('resize', ()=>{ resizeCanvas(); initParticles();});
  function update(){
    ctx.clearRect(0,0,W,H);
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(124,58,237,0.03)');
    g.addColorStop(1,'rgba(6,182,212,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    for(let p of particles){
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 1;
      if(d < 120){
        const force = (120 - d) * 0.0012 * (mouse.down ? 3 : 1);
        p.vx += (dx/d) * force;
        p.vy += (dy/d) * force;
      }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      if(p.y < -10) p.y = H+10;
      if(p.y > H+10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.95; ctx.shadowColor = p.c; ctx.shadowBlur = 8 * (1/DPR);
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    // link lines with reduced overhead
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy=a.y-b.y; const d = Math.sqrt(dx*dx+dy*dy);
        if(d<80){ ctx.globalAlpha = 0.06*(1 - d/80); ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.globalAlpha = 1; }
      }
    }
    requestAnimationFrame(update);
  }
  initParticles(); update();
})();

// Polished high-design cursor with contextual badges, drag-thumbnail and interactive effects (respects reduced-motion)
(function cursorStars(){
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  if(('ontouchstart' in window) || navigator.maxTouchPoints > 0) return; // hide on touch devices

  const el = document.createElement('div'); el.className = 'star-cursor';
  const badge = document.createElement('div'); badge.className = 'cursor-badge'; el.appendChild(badge);
  const thumb = document.createElement('div'); thumb.className = 'cursor-thumb'; el.appendChild(thumb);
  document.body.appendChild(el);

  let tx = -9999, ty = -9999, x = tx, y = ty; let anim;
  const lerp = (a,b,t)=> a + (b-a)*t;
  const interactiveSel = '[data-cursor], a,button,input,textarea,select,.btn,.feature-card,.branch-card,.team-card';
  let isHover = false;

  function onMove(e){ tx = e.clientX; ty = e.clientY; }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', (e)=>{ const t = e.touches && e.touches[0]; if(t) { tx = t.clientX; ty = t.clientY; } }, {passive:true});

  function loop(){ x = lerp(x, tx, 0.18); y = lerp(y, ty, 0.18); el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%,-50%) scale(${isHover?1.18:1})`; anim = requestAnimationFrame(loop); }
  anim = requestAnimationFrame(loop);

  function spawnBurst(cx, cy){ const count = 6 + Math.floor(Math.random()*6); for(let i=0;i<count;i++){ const b = document.createElement('div'); b.className = 'star-burst'; const ox = (Math.random()-0.5)*36; const oy = (Math.random()-0.5)*36; b.style.left = (cx + ox) + 'px'; b.style.top = (cy + oy) + 'px'; document.body.appendChild(b); b.addEventListener('animationend', ()=>{ try{b.remove()}catch(e){} }); } }

  // Show badge from data-cursor attribute on hover
  document.addEventListener('mouseover', (e)=>{
    const t = e.target.closest(interactiveSel);
    if(!t) return;
    const txt = t.getAttribute('data-cursor') || t.getAttribute('title') || t.textContent.trim().slice(0,20);
    if(txt){ badge.textContent = txt; badge.classList.add('visible'); }
    if(t.matches(interactiveSel)) { isHover = true; el.classList.add('hover'); }
  });
  document.addEventListener('mouseout', (e)=>{
    const t = e.target.closest(interactiveSel);
    if(!t) return;
    badge.classList.remove('visible'); isHover = false; el.classList.remove('hover');
  });

  // Drag-and-drop thumbnail preview on cursor when dragging files
  let draggingFiles = false;
  let dragThumbUrl = null;
  function showThumb(dataUrl){ thumb.innerHTML = ''; const img = document.createElement('img'); img.src = dataUrl; thumb.appendChild(img); thumb.style.display = 'block'; }
  function hideThumb(){ thumb.innerHTML = ''; thumb.style.display = 'none'; if(dragThumbUrl){ URL.revokeObjectURL(dragThumbUrl); dragThumbUrl = null; } }

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('contact-attachments');
  if(dropZone){
    ['dragenter','dragover'].forEach(ev=>{
      dropZone.addEventListener(ev, (e)=>{ e.preventDefault(); dropZone.classList.add('drop-active'); badge.textContent = 'Drop to attach'; badge.classList.add('visible'); });
    });
    ['dragleave','drop'].forEach(ev=>{
      dropZone.addEventListener(ev, (e)=>{ dropZone.classList.remove('drop-active'); badge.classList.remove('visible'); });
    });

    dropZone.addEventListener('drop', (e)=>{
      e.preventDefault(); const files = Array.from(e.dataTransfer.files || []);
      if(files.length){ // preview the first image on cursor
        const f = files.find(f=>f.type && f.type.startsWith('image/')) || files[0];
        if(f){ dragThumbUrl = URL.createObjectURL(f); showThumb(dragThumbUrl); }
        // set input files when possible
        try{ const dt = new DataTransfer(); files.slice(0,3).forEach(f=>dt.items.add(f)); fileInput.files = dt.files; const ev2 = new Event('change'); fileInput.dispatchEvent(ev2); }catch(err){ console.warn('Unable to assign dropped files to input'); }
      }
    });
  }

  // Click/capture thumbnail when file input changes
  fileInput && fileInput.addEventListener('change', ()=>{
    const f = Array.from(fileInput.files||[]).find(fi=>fi.type && fi.type.startsWith('image/'));
    if(f){ const url = URL.createObjectURL(f); showThumb(url); setTimeout(()=>{ hideThumb(); }, 2000); }
  });

  // Click burst
  window.addEventListener('mousedown', (e)=>{ el.classList.add('active'); spawnBurst(e.clientX, e.clientY); });
  window.addEventListener('mouseup', ()=>{ el.classList.remove('active'); });
  window.addEventListener('touchstart', (e)=>{ const t = e.touches && e.touches[0]; if(t){ el.classList.add('active'); spawnBurst(t.clientX, t.clientY); } }, {passive:true});
  window.addEventListener('touchend', ()=>{ el.classList.remove('active'); });

  // Progress & confetti on send (hook into existing form flow by listening to custom events)
  const progress = document.getElementById('send-progress'); const progressBar = progress && progress.querySelector('.progress-bar');
  const confetti = document.getElementById('confetti');
  // trigger confetti/pulse when send completes
  document.addEventListener('dv:sendcomplete', ()=>{ try{ spawnConfetti(); }catch(e){} });

  function spawnConfetti(){ if(!confetti) return; // spawn small dots around cursor
    for(let i=0;i<18;i++){ const d = document.createElement('div'); d.className='dot'; d.style.left = (tx + (Math.random()-0.5)*120) + 'px'; d.style.top = (ty + (Math.random()-0.5)*60) + 'px'; d.style.background = ['#ffd27a','#ffc857','#ff8fab','#9be3ff'][Math.floor(Math.random()*4)]; confetti.appendChild(d); setTimeout(()=>{ try{ d.remove(); }catch(e){} }, 1200); }
  }

})();

// Devotion / Prayer branches UI
(function branchesUI(){
  const branches = [
    {id:'morning', title:'Morning Devotion', desc:'Short reflection to start your day', content:'<p>Begin with a short reading and a prayer of thanks. Read Psalm 5:3 and spend a few moments in silent reflection.</p><p><strong>Prayer:</strong> Lord, guide my steps today and help me to honor you in all I do.</p>'},
    {id:'evening', title:'Evening Prayer', desc:'Restful reflection and thanks for the day', content:'<p>Recall the day and offer thanks. Read Psalm 4 and pray for rest and renewal.</p><p><strong>Prayer:</strong> Father, thank you for your provision today. Grant me restful sleep.</p>'},
    {id:'gratitude', title:'Gratitude Practice', desc:'Simple gratitude prompts and prayer', content:'<p>List three things you are thankful for. Offer a short prayer of gratitude for each.</p>'},
    {id:'intercessory', title:'Intercessory Prayer', desc:'Prayers for others', content:'<p>Bring others before God: family, friends, leaders, and those in need. Pray specifically and briefly for each.</p>'},
    {id:'confession', title:'Confession & Reflection', desc:'Quiet self-examination and confession', content:'<p>Quietly reflect, confess what you have done wrong, and seek God&apos;s forgiveness. Ask for strength to change.</p>'}
  ];

  const grid = document.getElementById('branches-grid');
  const modal = document.getElementById('branch-modal');
  const titleEl = document.getElementById('branch-title');
  const descEl = document.getElementById('branch-desc');
  const contentEl = document.getElementById('branch-content');
  const linkEl = document.getElementById('branch-page-link');

  const icons = {
    morning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    evening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    gratitude: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.78 0L12 5.6l-1.02-1a5.5 5.5 0 1 0-7.78 7.78L12 21.2l7.8-8.42a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    intercessory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>',
    confession: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M5 12h14"/></svg>'
  };

  function renderBranches(){
    grid.innerHTML = '';
    branches.forEach(b=>{
      const btn = document.createElement('button');
      btn.className='branch-card';
      btn.setAttribute('data-id', b.id);
      const iconHtml = `<div class="icon">${icons[b.id] || ''}</div>`;
      btn.innerHTML = `${iconHtml}<strong>${b.title}</strong><div class="muted">${b.desc}</div>`;
      btn.addEventListener('click', ()=>openBranch(b.id));
      grid.appendChild(btn);
    });
  }

  function openBranch(id){
    const b = branches.find(x=>x.id===id);
    if(!b) return;
    titleEl.textContent = b.title;
    descEl.textContent = b.desc;
    contentEl.innerHTML = b.content;
    linkEl.href = `pages/devotion.html#${b.id}`;

    // Apply saved font prefs to content
    const savedFamily = localStorage.getItem('dv_font_family') || 'sans';
    const savedSize = localStorage.getItem('dv_font_size') || '16';
    applyFontTo(contentEl, savedFamily, savedSize);
    branchFont.value = savedFamily; branchFontSize.value = savedSize;

    modal.setAttribute('aria-hidden','false');
    modal.classList.add('open');
    modal.querySelector('.modal-close').focus();
  }

  function closeBranch(){
    modal.setAttribute('aria-hidden','true');
    modal.classList.remove('open');
  }

  document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', closeBranch));
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeBranch();});

  renderBranches();

  // font helpers wired to modal controls
  const branchFont = document.getElementById('branch-font');
  const branchFontSize = document.getElementById('branch-font-size');
  function applyFontTo(el, family, size){
    el.classList.remove('font-sans','font-serif','font-hand');
    if(family === 'serif') el.classList.add('font-serif');
    else if(family === 'hand') el.classList.add('font-hand');
    else el.classList.add('font-sans');
    el.style.fontSize = (Number(size) || 16) + 'px';
  }
  if(branchFont && branchFontSize){
    // load saved values
    const f = localStorage.getItem('dv_font_family') || 'sans';
    const s = localStorage.getItem('dv_font_size') || '16';
    branchFont.value = f; branchFontSize.value = s;
    branchFont.addEventListener('change', ()=>{ localStorage.setItem('dv_font_family', branchFont.value); applyFontTo(contentEl, branchFont.value, branchFontSize.value); });
    branchFontSize.addEventListener('input', ()=>{ localStorage.setItem('dv_font_size', branchFontSize.value); applyFontTo(contentEl, branchFont.value, branchFontSize.value); });
  }

  // open branch if hash present (#morning etc.)
  const h = location.hash.replace('#','');
  if(h){ const exists = branches.find(b=>b.id===h); if(exists) openBranch(h); }

  // --- NEW: About page interactivity (accordions, counters, team bios)
  document.addEventListener('DOMContentLoaded', ()=>{
    // Accordions on about page
    document.querySelectorAll('.accordion-toggle').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        const panel = btn.nextElementSibling;
        if(!expanded) panel.style.maxHeight = panel.scrollHeight + 'px'; else panel.style.maxHeight = null;
      });
    });

    // Animated counters using IntersectionObserver
    const counters = document.querySelectorAll('.stat-value');
    const io = new IntersectionObserver((entries, ob)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          const el = en.target; const target = Number(el.dataset-target)||Number(el.dataset.target)||0; const tTarget = Number(el.dataset.target)||0; let cur = 0; const step = Math.max(1, Math.floor(tTarget/60));
          const t = setInterval(()=>{ cur += step; if(cur>=tTarget){ el.textContent = tTarget; clearInterval(t); } else el.textContent = cur; }, 18);
          ob.unobserve(el);
        }
      });
    }, {threshold:0.4});
    counters.forEach(c=>io.observe(c));

    // Team card show bio on focus/click
    document.querySelectorAll('.team-card').forEach(card=>{
      card.addEventListener('click', ()=>{ const bio = card.querySelector('.bio'); bio.hidden = !bio.hidden; });
      card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); card.click(); } });
    });

    // NEW: Expand/Collapse all accordions
    const accAllBtn = document.getElementById('accordion-all');
    if(accAllBtn){
      let allExpanded = false;
      accAllBtn.addEventListener('click', ()=>{
        allExpanded = !allExpanded; accAllBtn.textContent = allExpanded ? 'Collapse all' : 'Expand all';
        document.querySelectorAll('.accordion-toggle').forEach(btn=>{
          btn.setAttribute('aria-expanded', String(allExpanded));
          const panel = btn.nextElementSibling; panel.style.maxHeight = allExpanded ? panel.scrollHeight + 'px' : null;
        });
      });
    }

    // NEW: Subscribe form (local demo)
    const subBtn = document.getElementById('subscribe-btn');
    const subInput = document.getElementById('subscribe-email');
    const subToast = document.getElementById('subscribe-toast');
    function showSub(text){ if(!subToast) return; subToast.style.display='inline-block'; subToast.textContent = text; clearTimeout(subToast._t); subToast._t = setTimeout(()=>subToast.style.display='none',2000); }
    if(subBtn && subInput){
      subBtn.addEventListener('click', ()=>{
        const email = (subInput.value||'').trim();
        if(!email){ showSub('Enter email'); return; }
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!re.test(email)){ showSub('Enter a valid email'); return; }
        const arr = JSON.parse(localStorage.getItem('dv_subscribers') || '[]'); if(!arr.includes(email)) arr.push(email); localStorage.setItem('dv_subscribers', JSON.stringify(arr));
        showSub('Subscribed'); subInput.value='';
      });
    }

    // NEW: Donate modal
    const donateBtn = document.getElementById('donate-btn');
    const donateModal = document.getElementById('donate-modal');
    if(donateBtn && donateModal){
      donateBtn.addEventListener('click', ()=>{ donateModal.setAttribute('aria-hidden','false'); donateModal.classList.add('open'); donateModal.querySelector('.modal-close').focus(); });
      donateModal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', ()=>{ donateModal.setAttribute('aria-hidden','true'); donateModal.classList.remove('open'); }));
      window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && donateModal.classList.contains('open')){ donateModal.setAttribute('aria-hidden','true'); donateModal.classList.remove('open'); } });
    }

    // Team action reveals (accessibility support already via focus & hover)
    document.querySelectorAll('.team-card').forEach(card=>{
      card.addEventListener('focusin', ()=>{ const a = card.querySelector('.team-actions'); if(a) a.style.opacity=1; });
      card.addEventListener('focusout', ()=>{ const a = card.querySelector('.team-actions'); if(a) a.style.opacity=0; });
    });

  });
})();

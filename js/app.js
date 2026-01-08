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

translateSelect.addEventListener('change', ()=>{ localStorage.setItem('dv_trans', translateSelect.value); render(); });

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
  if(m) idx = Number(m[1])%verses.length;
  if(t && t[1]){ translateSelect.value = t[1]; localStorage.setItem('dv_trans', t[1]); }
  render();
})();

// Respect reduced motion for typing
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const originalTypeWrite = typeWrite;
if(prefersReducedMotion){
  typeWrite = function(str){ verseText.textContent = str; };
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

// Cursor star and click/touch burst (respects reduced-motion)
(function cursorStars(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const starEl = document.createElement('div'); starEl.className = 'star-cursor'; document.body.appendChild(starEl);
  let raf = null; let x = -9999, y = -9999;
  function moveTo(nx, ny){ x = nx; y = ny; if(!raf){ raf = requestAnimationFrame(()=>{ starEl.style.left = x + 'px'; starEl.style.top = y + 'px'; raf = null; }); } }

  function spawnBurst(cx, cy){
    const count = 6 + Math.floor(Math.random()*4);
    for(let i=0;i<count;i++){
      const s = document.createElement('div'); s.className='star';
      const ox = (Math.random()-0.5)*18; const oy = (Math.random()-0.8)*18;
      s.style.left = (cx + ox) + 'px'; s.style.top = (cy + oy) + 'px';
      s.style.background = `linear-gradient(45deg, #fff, var(--accent))`;
      document.body.appendChild(s);
      s.addEventListener('animationend', ()=>{ try{s.remove()}catch(e){} });
    }
  }

  window.addEventListener('mousemove', (e)=> moveTo(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e)=>{ const t=e.touches[0]; if(t) moveTo(t.clientX, t.clientY); }, {passive:true});

  window.addEventListener('mousedown', (e)=>{ starEl.classList.add('active'); spawnBurst(e.clientX, e.clientY); });
  window.addEventListener('mouseup', ()=>{ starEl.classList.remove('active'); });
  window.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; if(t){ starEl.classList.add('active'); spawnBurst(t.clientX, t.clientY); } }, {passive:true});
  window.addEventListener('touchend', ()=>{ starEl.classList.remove('active'); });
})();

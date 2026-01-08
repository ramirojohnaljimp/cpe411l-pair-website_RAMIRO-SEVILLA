// Simple verse app with animations and interactivity
const verses = [
  {ref:'John 3:16', text:'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'},
  {ref:'Psalm 23:1', text:'The LORD is my shepherd; I shall not want.'},
  {ref:'Romans 8:28', text:'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'},
  {ref:'Philippians 4:13', text:'I can do all things through Christ which strengtheneth me.'},
  {ref:'Proverbs 3:5', text:'Trust in the LORD with all thine heart; and lean not unto thine own understanding.'}
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
  verseRef.textContent = v.ref;
  typeWrite(v.text);
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
  navigator.clipboard.writeText(`${verses[idx].text} — ${verses[idx].ref}`).then(()=>showToast('Copied to clipboard'));
});
shareBtn.addEventListener('click', ()=>{
  const url = location.origin + location.pathname + `#v=${idx}`;
  navigator.clipboard.writeText(url).then(()=>showToast('Share link copied'));
});

searchInput.addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){setIndex(0);return}
  const found = verses.findIndex(v=>v.ref.toLowerCase().includes(q) || v.text.toLowerCase().includes(q));
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
  if(m) idx = Number(m[1])%verses.length;
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
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const colors = ['#FFC857','#7C3AED','#06B6D4'];
  let particles = [];
  const count = Math.max(40, Math.floor((W*H)/90000));
  function rand(min,max){ return Math.random()*(max-min)+min; }
  function initParticles(){
    particles = [];
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*W,
        y: Math.random()*H,
        vx: rand(-0.3,0.3),
        vy: rand(-0.3,0.3),
        r: rand(0.8,3)+Math.random(),
        c: colors[i%colors.length],
      });
    }
  }
  let mouse = {x:-9999,y:-9999,down:false};
  window.addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });
  window.addEventListener('mousedown', ()=>mouse.down=true);
  window.addEventListener('mouseup', ()=>mouse.down=false);
  window.addEventListener('resize', ()=>{ W=canvas.width=innerWidth; H=canvas.height=innerHeight; initParticles();});
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
        const force = (120 - d) * 0.0015 * (mouse.down ? 3 : 1);
        p.vx += (dx/d) * force;
        p.vy += (dy/d) * force;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      if(p.y < -10) p.y = H+10;
      if(p.y > H+10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.95; ctx.shadowColor = p.c; ctx.shadowBlur = 8;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy=a.y-b.y; const d = Math.sqrt(dx*dx+dy*dy);
        if(d<90){ ctx.globalAlpha = 0.06*(1 - d/90); ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.globalAlpha = 1; }
      }
    }
    requestAnimationFrame(update);
  }
  initParticles(); update();
})();

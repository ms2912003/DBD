// ---------- Year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
},{ threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ---------- Music toggle ----------
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;

// Attempt autoplay (may be blocked); show button regardless
function toggleMusic(){
  if(!music.src) {
    // If you add a file later, remove this guard.
    // alert('Add a music file at assets/music/... then remove this message.');
  }
  if(isPlaying){ music.pause(); isPlaying = false; musicToggle.textContent = '♪'; }
  else { music.play().catch(()=>{}); isPlaying = true; musicToggle.textContent = '❚❚'; }
}
musicToggle.addEventListener('click', toggleMusic);

// ---------- Carousel ----------
const slides = document.getElementById('slides');
const slideEls = Array.from(slides.children);
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.getElementById('dots');

let index = 0;

function setIndex(i){
  index = (i + slideEls.length) % slideEls.length;
  slides.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

function updateDots(){
  dots.querySelectorAll('button').forEach((b, i) => {
    b.classList.toggle('active', i === index);
  });
}

function buildDots(){
  slideEls.forEach((_, i) => {
    const b = document.createElement('button');
    b.addEventListener('click', () => setIndex(i));
    dots.appendChild(b);
  });
  updateDots();
}

prevBtn.addEventListener('click', () => setIndex(index - 1));
nextBtn.addEventListener('click', () => setIndex(index + 1));
buildDots();

// Optional auto-play (pause if not desired)
let auto = setInterval(()=> setIndex(index + 1), 5000);
slides.addEventListener('mouseenter', () => clearInterval(auto));
slides.addEventListener('mouseleave', () => auto = setInterval(()=> setIndex(index + 1), 5000));

// ---------- Confetti ----------
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle{
  constructor(){
    this.reset();
  }
  reset(){
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = 6 + Math.random() * 10;
    this.speed = 1 + Math.random() * 3;
    this.spin = (Math.random() * 2 - 1) * 0.1;
    this.angle = Math.random() * Math.PI * 2;
    // Pastel colors to match theme
    const colors = ['#ff8fb1','#ffd0df','#b0e0e6','#fff2a8','#c9f2e5','#f7c6ff'];
    this.color = colors[Math.floor(Math.random()*colors.length)];
  }
  update(){
    this.y += this.speed;
    this.x += Math.sin(this.angle) * 0.8;
    this.angle += this.spin;
    if(this.y > canvas.height + 20) this.reset();
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    ctx.restore();
  }
}

let particles = [];
function confettiBurst(){
  particles = Array.from({length: 220}, () => new Particle());
  let t = 0;
  function animate(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    if(t < 600) requestAnimationFrame(animate);
  }
  animate();
}

const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseGif = document.getElementById('surpriseGif');

surpriseBtn.addEventListener('click', () => {
  confettiBurst();
  if (surpriseGif) {
    surpriseGif.hidden = false;
    // Optional gentle scroll into view
    surpriseGif.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// ---------- Accessibility niceties ----------
document.addEventListener('keydown',(e)=>{
  if(e.key === 'ArrowRight') setIndex(index + 1);
  if(e.key === 'ArrowLeft') setIndex(index - 1);
});

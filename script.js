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

// ---------- Carousel functionality (generalized for multiple carousels) ----------
const carousels = document.querySelectorAll('.carousel');

carousels.forEach(carousel => {
  const slides = carousel.querySelector('.slides');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  const dotsContainer = carousel.querySelector('.dots');
  const slideEls = Array.from(slides.children);
  let index = 0;

  function setIndex(i) {
    index = (i + slideEls.length) % slideEls.length;
    slides.style.transform = `translateX(${-index * 100}%)`;
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('button').forEach((b, i) => {
      b.classList.toggle('active', i === index);
    });
  }

  function buildDots() {
    if (!dotsContainer) return;
    slideEls.forEach((_, i) => {
      const b = document.createElement('button');
      b.addEventListener('click', () => setIndex(i));
      dotsContainer.appendChild(b);
    });
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => setIndex(index - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => setIndex(index + 1));
  }

  buildDots();

  // Add keyboard navigation for each carousel
  document.addEventListener('keydown', (e) => {
    if (carousel.contains(document.activeElement)) {
      if (e.key === 'ArrowRight') setIndex(index + 1);
      if (e.key === 'ArrowLeft') setIndex(index - 1);
    }
  });

});

const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('musicToggle');

// Try to play immediately
window.addEventListener("load", () => {
  bgMusic.play().catch(() => {
    // If autoplay blocked, wait for first click/touch
    document.body.addEventListener("click", () => {
      bgMusic.play();
    }, { once: true });
  });
});

// Toggle play/pause manually
musicToggle.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = "🔊";
  } else {
    bgMusic.pause();
    musicToggle.textContent = "♪";
  }
});


// ===================== Fireworks =====================
(() => {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const rockets = [];

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function launchRocket() {
    const x = rand(w * 0.15, w * 0.85);
    const y = h + 10;
    const vy = rand(-10.5, -13.5);
    const vx = rand(-1.2, 1.2);
    const color = `hsl(${Math.floor(rand(260, 360))}, 90%, 60%)`;
    rockets.push({x, y, vx, vy, color, life: rand(0.8, 1.2)});
  }

  function explode(x, y, baseHue) {
    const count = Math.floor(rand(36, 72));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
      const speed = rand(2, 5.2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const hue = baseHue + rand(-20, 20);
      particles.push({
        x, y, vx, vy,
        alpha: 1,
        radius: rand(1.2, 2.6),
        color: `hsl(${hue}, 100%, ${rand(55, 70)}%)`,
        gravity: 0.06,
        decay: rand(0.008, 0.02)
      });
    }
  }

  let last = 0, acc = 0, freq = 900; // ms between rocket launches
  function tick(ts){
    if(!last) last = ts;
    const dt = ts - last; last = ts; acc += dt;

    // semi-transparent fade for trails
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';

    // launch rockets periodically
    while (acc > freq){
      acc -= freq;
      // launch 1–2 rockets
      const launches = Math.random() < 0.4 ? 2 : 1;
      for(let i=0;i<launches;i++) launchRocket();
      // sometimes faster cadence
      if (Math.random() < 0.25) freq = 600; else freq = 900;
    }

    // update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.08; // gravity
      r.life -= 0.01;

      // draw rocket flare
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();

      // explode at peak
      if (r.vy > -1 || r.life <= 0 || r.y < h * 0.25) {
        const hue = parseInt(r.color.match(/hsl\((\d+)/)[1], 10);
        explode(r.x, r.y, hue);
        rockets.splice(i, 1);
      }
    }

    // update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i,1); continue; }

      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Bonus: burst on clicks/taps
  window.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    explode(x, y, Math.floor(rand(280, 360)));
  });
})();

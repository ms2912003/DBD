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
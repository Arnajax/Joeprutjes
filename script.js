/* ============================================================
   JOEP RUTJES — Model Portfolio
   script.js  (architecture mirrored from bentewesselink.com)
   ============================================================ */

/* ----------------------------------------------------------
   1. Navigation — scroll detection & hamburger menu
---------------------------------------------------------- */
const nav        = document.getElementById('nav');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('is-open');
  navLinks.classList.toggle('is-open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && hamburger.classList.contains('is-open')) {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});

navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});

/* ----------------------------------------------------------
   2. Fade-in on scroll (IntersectionObserver)
---------------------------------------------------------- */
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ----------------------------------------------------------
   3. Active nav link highlighting
---------------------------------------------------------- */
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ----------------------------------------------------------
   4. Portfolio — load more (mobile only)
---------------------------------------------------------- */
const loadMoreBtn  = document.getElementById('loadMore');
const extraItems   = document.querySelectorAll('.portfolio__item--extra');

if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    extraItems.forEach(item => {
      item.classList.add('is-revealed');
      // Trigger fade-in for newly revealed items
      item.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
      if (item.classList.contains('fade-in')) fadeObserver.observe(item);
    });
    loadMoreBtn.classList.add('is-done');
  });
}

/* ----------------------------------------------------------
   5. Lightbox Gallery
---------------------------------------------------------- */

// Inject lightbox styles dynamically
const lbStyle = document.createElement('style');
lbStyle.textContent = `
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(26, 22, 20, 0.96);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .lightbox.is-open {
    opacity: 1;
    pointer-events: auto;
  }
  .lightbox__img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    display: block;
    transition: opacity 0.2s ease;
  }
  .lightbox__close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: none;
    border: none;
    color: rgba(255,255,255,0.65);
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.5rem;
    transition: color 0.2s ease;
  }
  .lightbox__close:hover { color: #fff; }
  .lightbox__prev,
  .lightbox__next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255,255,255,0.55);
    font-size: 2.25rem;
    cursor: pointer;
    padding: 1rem 1.25rem;
    transition: color 0.2s ease;
    line-height: 1;
  }
  .lightbox__prev { left: 0.5rem; }
  .lightbox__next { right: 0.5rem; }
  .lightbox__prev:hover,
  .lightbox__next:hover { color: #fff; }
  .lightbox__counter {
    position: absolute;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }
  @media (max-width: 600px) {
    .lightbox__prev { left: 0; }
    .lightbox__next { right: 0; }
  }
`;
document.head.appendChild(lbStyle);

// Build lightbox DOM
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Photo viewer');
lightbox.innerHTML = `
  <button class="lightbox__close" aria-label="Close">&times;</button>
  <button class="lightbox__prev" aria-label="Previous photo">&#8592;</button>
  <img class="lightbox__img" src="" alt="Joep Rutjes portfolio photo">
  <button class="lightbox__next" aria-label="Next photo">&#8594;</button>
  <span class="lightbox__counter"></span>
`;
document.body.appendChild(lightbox);

const lbImg     = lightbox.querySelector('.lightbox__img');
const lbClose   = lightbox.querySelector('.lightbox__close');
const lbPrev    = lightbox.querySelector('.lightbox__prev');
const lbNext    = lightbox.querySelector('.lightbox__next');
const lbCounter = lightbox.querySelector('.lightbox__counter');

let images       = [];
let currentIndex = 0;

function buildImageList() {
  images = [];
  document.querySelectorAll('.portfolio__img-wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (img && img.src) {
      images.push({ src: img.src, alt: img.alt || 'Joep Rutjes' });
    }
  });
}

function openLightbox(index) {
  buildImageList();
  if (!images.length) return; // No real images yet — placeholders only
  currentIndex = Math.min(index, images.length - 1);
  renderImage();
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

function renderImage() {
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = images[currentIndex].src;
    lbImg.alt = images[currentIndex].alt;
    lbImg.style.opacity = '1';
    lbCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  }, 160);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  renderImage();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  renderImage();
}

// Bind clicks on portfolio wrappers
document.querySelectorAll('.portfolio__img-wrap').forEach((wrap, i) => {
  wrap.style.cursor = 'pointer';
  wrap.addEventListener('click', () => openLightbox(i));
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevImage);
lbNext.addEventListener('click', nextImage);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

// Touch / swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) dx < 0 ? nextImage() : prevImage();
});

/* ----------------------------------------------------------
   6. Footer — auto-update copyright year
---------------------------------------------------------- */
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ----------------------------------------------------------
   7. Hero nav — invert link colours while hero is visible
---------------------------------------------------------- */
const heroSection = document.getElementById('hero');
if (heroSection) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      nav.classList.toggle('nav--over-hero', entry.isIntersecting);
    });
  }, { threshold: 0.1 });
  heroObserver.observe(heroSection);
}

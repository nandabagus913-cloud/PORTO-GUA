// ===================================================================
// Loader — hides as soon as the page is actually ready. We only add a
// small buffer (min 250ms) so the fade-out animation never looks like
// a flash on fast connections, instead of forcing every visitor to
// wait a fixed, arbitrary amount of time regardless of load speed.
// ===================================================================
const loaderStart = performance.now();
const MIN_LOADER_MS = 250;

function hideLoader() {
  const elapsed = performance.now() - loaderStart;
  const remaining = Math.max(MIN_LOADER_MS - elapsed, 0);
  setTimeout(() => document.getElementById('loader').classList.add('hide'), remaining);
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader);
}

// Pointer devices only: phones/tablets skip custom cursor, magnetic
// buttons and tilt so nothing feels stuck or laggy on touch.
const HAS_FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ===================================================================
// Custom cursor (dot + trailing ring)
// ===================================================================
if (HAS_FINE_POINTER) {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  window.addEventListener('mousedown', () => dot.classList.add('click'));
  window.addEventListener('mouseup', () => dot.classList.remove('click'));

  function animRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  function bindCursorHover(root = document) {
    root.querySelectorAll('a, button, .card, .filter-btn, .faq-q, .pill').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '50px'; ring.style.height = '50px';
        ring.style.borderColor = 'rgba(255,155,84,.75)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '34px'; ring.style.height = '34px';
        ring.style.borderColor = 'rgba(198,255,92,.35)';
      });
    });
  }
  bindCursorHover();
}

// ===================================================================
// Navbar: scrolled state + hide on scroll-down, show on scroll-up
// ===================================================================
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  backToTop.classList.toggle('show', y > 600);

  if (y > lastScroll && y > 200) {
    navbar.classList.add('hide');
  } else {
    navbar.classList.remove('hide');
  }
  lastScroll = y;
}, { passive: true });

// ===================================================================
// Mobile menu
// ===================================================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', i));

hamburger.setAttribute('aria-expanded', 'false');
hamburger.setAttribute('aria-controls', 'mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

// ===================================================================
// Hero social icons stagger index
// ===================================================================
document.querySelectorAll('.social-orbit a').forEach((a, i) => a.style.setProperty('--i', i));

// ===================================================================
// Typing animation
// ===================================================================
const phrases = ['Creative Frontend Developer', 'UI/UX Enthusiast', 'Freelance Web Developer'];
const typingEl = document.getElementById('typing-text');
let pIndex = 0, cIndex = 0, deleting = false;

function typeLoop() {
  const current = phrases[pIndex];
  if (!deleting) {
    cIndex++;
    typingEl.textContent = current.slice(0, cIndex);
    if (cIndex === current.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
  } else {
    cIndex--;
    typingEl.textContent = current.slice(0, cIndex);
    if (cIndex === 0) { deleting = false; pIndex = (pIndex + 1) % phrases.length; }
  }
  setTimeout(typeLoop, deleting ? 40 : 80);
}
typeLoop();

// ===================================================================
// Staggered scroll reveal (auto-assigns delay per sibling group)
// ===================================================================
const revealGroups = new Map();
document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(el => {
  const parent = el.parentElement;
  const count = revealGroups.get(parent) || 0;
  el.style.setProperty('--d', Math.min(count * 0.09, 0.5) + 's');
  revealGroups.set(parent, count + 1);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(el => io.observe(el));

// ===================================================================
// Animated stat counters
// ===================================================================
function animateCounter(el) {
  const raw = el.dataset.count;
  const suffix = raw.replace(/[0-9]/g, '');
  const target = parseInt(raw, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statIo = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); statIo.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-count]').forEach(el => statIo.observe(el));

// ===================================================================
// Magnetic buttons (subtle pull toward cursor)
// ===================================================================
if (HAS_FINE_POINTER) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${relX * 0.18}px, ${relY * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ===================================================================
// 3D tilt effect on cards (project + cert + service)
// ===================================================================
function applyTilt(selector, intensity = 8) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px * intensity}deg) rotateX(${-py * intensity}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

if (HAS_FINE_POINTER) {
  applyTilt('.project-card', 6);
  applyTilt('.cert-card', 8);
  applyTilt('.service-card', 6);
  applyTilt('.testi-card', 5);

  // Glow orbs follow cursor slightly (parallax)
  const orbA = document.querySelector('.glow-orb.a');
  const orbB = document.querySelector('.glow-orb.b');
  window.addEventListener('mousemove', e => {
    const px = (e.clientX / window.innerWidth - 0.5) * 40;
    const py = (e.clientY / window.innerHeight - 0.5) * 40;
    orbA.style.transform = `translate(${px}px, ${py}px) scale(1)`;
    orbB.style.transform = `translate(${-px}px, ${-py}px) scale(1)`;
  });
}

// ===================================================================
// Project filter
// ===================================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#projectGrid .project-card').forEach(card => {
      const cats = card.dataset.cat.split(' ');
      const match = filter === 'all' || cats.includes(filter);
      card.classList.toggle('hidden', !match);
    });
  });
});

// ===================================================================
// FAQ accordion
// ===================================================================
function toggleFaq(el) {
  const item = el.parentElement;
  const answer = item.querySelector('.faq-a');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-a').style.maxHeight = null;
  });
  if (!wasOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}
window.toggleFaq = toggleFaq;

// ===================================================================
// Certificate modal
// ===================================================================
function openCert(title, issuer, date) {
  document.getElementById('certTitle').textContent = title;
  document.getElementById('certIssuer').textContent = issuer + ' \u00B7 ' + date;
  const modal = document.getElementById('certModal');
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('show'));
}
function closeCert() {
  const modal = document.getElementById('certModal');
  modal.classList.remove('show');
  setTimeout(() => { modal.style.display = 'none'; }, 250);
}
window.openCert = openCert;
window.closeCert = closeCert;

// Close on backdrop click (clicking outside the card) or Esc key
const certModalEl = document.getElementById('certModal');
certModalEl.addEventListener('click', (e) => {
  if (e.target === certModalEl) closeCert();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && certModalEl.classList.contains('show')) closeCert();
});

// ===================================================================
// Active nav link on scroll
// ===================================================================
const sections = ['about', 'skills', 'projects', 'contact'];
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 200) current = id;
  });
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

// ===================================================================
// Back to top
// ===================================================================
backToTop.addEventListener('click', () => {
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
});

// ===================================================================
// Hide the floating WhatsApp button while the Contact section (which
// already has its own large WA CTA) is on screen — keeps mobile UI clean.
// ===================================================================
const waFloat = document.querySelector('.wa-float');
const contactSection = document.getElementById('contact');
if (waFloat && contactSection) {
  const contactIo = new IntersectionObserver((entries) => {
    entries.forEach(e => waFloat.classList.toggle('near-contact', e.isIntersecting));
  }, { threshold: 0.15 });
  contactIo.observe(contactSection);
}
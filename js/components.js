/* ============================================
   MNEMERCH — Компоненты и утилиты
   ============================================ */

// --- Header / Footer Loading ---
document.addEventListener('DOMContentLoaded', function () {
  Promise.all([
    loadComponent('header-placeholder', 'components/header.html'),
    loadComponent('footer-placeholder', 'components/footer.html')
  ]).then(function () {
    afterComponentsLoaded();
  });
});

function loadComponent(id, url) {
  const el = document.getElementById(id);
  if (!el) return Promise.resolve();

  return fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.text();
    })
    .then(html => {
      el.outerHTML = html;
    })
    .catch(error => {
      console.error(error);
      el.outerHTML = '';
    });
}

function afterComponentsLoaded() {
  initHeaderScroll();
  initBurgerMenu();
  initSmoothScroll();
  initScrollAnimations();
  setActiveNav();
}

// --- Header scroll shadow ---
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header || header.dataset.scrollBound === 'true') return;
  header.dataset.scrollBound = 'true';

  function updateHeaderState() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

// --- Burger menu ---
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;
  if (burger.dataset.bound === 'true') return;

  burger.dataset.bound = 'true';
  if (!nav.id) nav.id = 'site-nav';
  burger.setAttribute('aria-controls', nav.id);
  burger.setAttribute('aria-expanded', 'false');

  function closeMenu() {
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    const isOpen = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    if (e.target.closest('.nav') || e.target.closest('.burger')) return;
    closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
  if (document.documentElement.dataset.smoothScrollBound === 'true') return;
  document.documentElement.dataset.smoothScrollBound = 'true';

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.includes('javascript')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.body.classList.remove('nav-open');
        const burger = document.querySelector('.burger');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// --- Scroll animations (IntersectionObserver) ---
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.anim').forEach(function (el) { el.classList.add('show'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.anim:not(.show)').forEach(function (el) {
    observer.observe(el);
  });
}

// --- Set active nav link ---
function setActiveNav() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// --- Legacy form handler. New lead forms use js/leads.js. ---
function handleForm(formId, fields, successMsg) {
  return function (e) {
    e.preventDefault();
    const data = {};
    let valid = true;
    fields.forEach(function (f) {
      const el = document.getElementById(formId + '-' + f);
      if (el) {
        data[f] = el.value.trim();
        if (!data[f]) valid = false;
      }
    });
    if (!valid) {
      alert('Пожалуйста, заполните все поля');
      return false;
    }
    console.log('[ЗАЯВКА]', formId, data);
    alert(successMsg || 'Спасибо! Мы свяжемся с вами в ближайшее время.');
    if (e.target && e.target.reset) e.target.reset();
    return false;
  };
}

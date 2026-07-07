/* ============================================
   MNEMERCH — Компоненты и утилиты
   ============================================ */

// --- Header / Footer Loading ---
document.addEventListener('DOMContentLoaded', function () {
  loadComponent('header-placeholder', 'components/header.html');
  loadComponent('footer-placeholder', 'components/footer.html');
});

function loadComponent(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.text();
    })
    .then(html => {
      el.outerHTML = html;
      afterComponentsLoaded();
    })
    .catch(() => {
      // Fallback: even if header/footer fail to load, init page behavior
      // so .anim content is not stuck invisible
      el.outerHTML = '';
      afterComponentsLoaded();
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
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// --- Burger menu ---
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;
  if (burger.dataset.bound === 'true') return;
  burger.dataset.bound = 'true';
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', function () {
    const isOpen = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    if (e.target.closest('.nav') || e.target.closest('.burger')) return;
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  });
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.includes('javascript')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        const nav = document.querySelector('.nav');
        if (nav && nav.style.display === 'flex') nav.style.display = 'none';
      }
    });
  });
}

// --- Scroll animations (IntersectionObserver) ---
function initScrollAnimations() {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.anim').forEach(function (el) {
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

// --- Simple form handler (console log + alert) ---
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

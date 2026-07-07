/* ============================================
   MNEMERCH — согласие на cookie/аналитику
   Работает уже на GitHub Pages и без переделок подходит для production.
   Необязательные скрипты подключать через MneConsent.loadScriptWhenAllowed().
   ============================================ */
(function () {
  'use strict';

  var CFG = window.MNE_CONFIG || {};
  var STORAGE_KEY = CFG.consentStorageKey || 'mnemerch_cookie_consent_v1';
  var VERSION = '1.0';
  var callbacks = [];

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(prefs) {
    var consent = {
      version: VERSION,
      date: new Date().toISOString(),
      necessary: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}

    callbacks.forEach(function (fn) {
      try { fn(consent); } catch (e) { console.error(e); }
    });

    return consent;
  }

  function has(category) {
    if (category === 'necessary') return true;
    var consent = readConsent();
    return !!(consent && consent[category]);
  }

  function removeBanner() {
    var banner = document.querySelector('.cookie-consent');
    if (banner) banner.remove();
  }

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    removeBanner();
  }

  function acceptNecessary() {
    saveConsent({ analytics: false, marketing: false });
    removeBanner();
  }

  function saveSettings() {
    var analytics = document.getElementById('cookieAnalytics');
    var marketing = document.getElementById('cookieMarketing');
    saveConsent({
      analytics: !!(analytics && analytics.checked),
      marketing: !!(marketing && marketing.checked)
    });
    removeBanner();
  }

  function renderBanner() {
    if (readConsent() || document.querySelector('.cookie-consent')) return;

    var banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Настройки cookie');
    banner.innerHTML = '' +
      '<div class="cookie-consent__text">' +
        '<strong>Cookie и данные браузера</strong>' +
        '<p>Мы используем необходимые данные браузера для работы сайта и можем использовать аналитику после вашего согласия. Кэш браузера помогает быстрее загружать страницы.</p>' +
        '<a href="privacy.html#cookies">Подробнее в политике</a>' +
      '</div>' +
      '<div class="cookie-consent__settings" hidden>' +
        '<label><input type="checkbox" checked disabled> Необходимые данные</label>' +
        '<label><input type="checkbox" id="cookieAnalytics"> Аналитика сайта</label>' +
        '<label><input type="checkbox" id="cookieMarketing"> Рекламные и маркетинговые сервисы</label>' +
      '</div>' +
      '<div class="cookie-consent__actions">' +
        '<button type="button" class="btn btn-primary" data-cookie-action="accept-all">Принять все</button>' +
        '<button type="button" class="btn btn-outline" data-cookie-action="necessary">Только необходимые</button>' +
        '<button type="button" class="cookie-consent__link" data-cookie-action="settings">Настроить</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var action = event.target && event.target.getAttribute('data-cookie-action');
      if (!action) return;

      if (action === 'accept-all') acceptAll();
      if (action === 'necessary') acceptNecessary();
      if (action === 'save-settings') saveSettings();
      if (action === 'settings') {
        var settings = banner.querySelector('.cookie-consent__settings');
        var btn = banner.querySelector('[data-cookie-action="settings"]');
        if (settings) settings.hidden = false;
        if (btn) {
          btn.textContent = 'Сохранить выбор';
          btn.setAttribute('data-cookie-action', 'save-settings');
        }
      }
    });

    document.body.appendChild(banner);
  }

  function onChange(fn) {
    if (typeof fn === 'function') callbacks.push(fn);
  }

  function loadScriptWhenAllowed(options) {
    options = options || {};
    var category = options.category || 'analytics';
    var src = options.src;
    if (!src) return;

    function load(consent) {
      if (consent && consent[category]) {
        var script = document.createElement('script');
        script.src = src;
        script.async = options.async !== false;
        if (options.id) script.id = options.id;
        document.head.appendChild(script);
      }
    }

    var current = readConsent();
    if (current) load(current);
    onChange(load);
  }

  window.MneConsent = {
    get: readConsent,
    has: has,
    save: saveConsent,
    onChange: onChange,
    showBanner: renderBanner,
    reset: function () {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      renderBanner();
    },
    loadScriptWhenAllowed: loadScriptWhenAllowed
  };

  document.addEventListener('DOMContentLoaded', renderBanner);
})();

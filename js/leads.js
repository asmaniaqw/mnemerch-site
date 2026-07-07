/* ============================================
   MNEMERCH — единая обработка заявок
   GitHub Pages: честный fallback в WhatsApp.
   Production: отправка в /api/lead с fallback в WhatsApp при ошибке.
   ============================================ */
(function () {
  'use strict';

  var PHONE = '79082198800';
  var TELEGRAM_URL = 'https://t.me/Tatyana_Arzamastceva';
  var API_URL = 'api/lead';
  var IS_GITHUB_PAGES = window.location.hostname.endsWith('github.io');

  var LABELS = {
    name: 'Имя',
    phone: 'Телефон / Telegram',
    email: 'Email',
    company: 'Компания',
    quantity: 'Тираж',
    budget: 'Бюджет',
    deadline: 'Срок',
    message: 'Задача',
    product: 'Товар',
    productUrl: 'Ссылка на товар',
    source: 'Источник'
  };

  function clean(value) {
    return String(value || '').trim();
  }

  function buildLeadText(data) {
    var lines = ['Здравствуйте! Хочу получить расчёт по корпоративному мерчу.'];
    Object.keys(data || {}).forEach(function (key) {
      var value = clean(data[key]);
      if (!value) return;
      lines.push((LABELS[key] || key) + ': ' + value);
    });
    lines.push('Страница: ' + window.location.href);
    return lines.join('\n');
  }

  function getStatusElement(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    if (target.classList && target.classList.contains('lead-status')) return target;
    if (target.querySelector) return target.querySelector('.lead-status');
    return null;
  }

  function showStatus(target, message, type) {
    var el = getStatusElement(target);
    if (!el) return;
    el.textContent = message;
    el.className = 'lead-status ' + (type || 'info');
  }

  function hasConsent(scope) {
    if (!scope || !scope.querySelector) return true;
    var input = scope.querySelector('input[name="personalDataConsent"]');
    return !input || input.checked;
  }

  function requireConsent(scope, statusTarget) {
    if (hasConsent(scope)) return true;
    showStatus(statusTarget || scope, 'Нужно согласие на обработку персональных данных.', 'error');
    var input = scope.querySelector('input[name="personalDataConsent"]');
    if (input && input.focus) input.focus();
    return false;
  }

  function openWhatsApp(data) {
    var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(buildLeadText(data));
    var opened = window.open(url, '_blank', 'noopener');
    if (!opened) window.location.href = url;
    return true;
  }

  function submitLead(data, options) {
    options = options || {};
    var statusTarget = options.statusTarget || options.form || null;

    if (IS_GITHUB_PAGES) {
      openWhatsApp(data);
      showStatus(statusTarget, 'Открыли WhatsApp с заполненным сообщением. Отправьте его, чтобы менеджер получил заявку.', 'success');
      return Promise.resolve({ ok: true, mode: 'whatsapp' });
    }

    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }).then(function (response) {
      if (!response.ok) throw new Error('Lead submit failed: ' + response.status);
      showStatus(statusTarget, 'Спасибо! Заявка отправлена. Мы свяжемся с вами в рабочее время.', 'success');
      if (options.form && options.form.reset) options.form.reset();
      return { ok: true, mode: 'api' };
    }).catch(function (error) {
      console.error(error);
      openWhatsApp(data);
      showStatus(statusTarget, 'Не удалось отправить заявку через сайт. Открыли WhatsApp с вашим сообщением — отправьте его менеджеру.', 'error');
      return { ok: false, mode: 'whatsapp-fallback', error: error };
    });
  }

  window.MneLeads = {
    isGithubPages: function () { return IS_GITHUB_PAGES; },
    buildLeadText: buildLeadText,
    showStatus: showStatus,
    requireConsent: requireConsent,
    submitLead: submitLead,
    openWhatsApp: openWhatsApp,
    telegramUrl: TELEGRAM_URL
  };

  // Обратная совместимость для старых обработчиков.
  window.submitMneLead = function (data) {
    return submitLead(data || {});
  };
})();

/* ============================================
   MNEMERCH — настройки окружения
   GitHub Pages используется как публичный стенд для проверки production-версии.
   При переносе на mnemerch.ru меняем значения здесь, а не переписываем формы.
   ============================================ */
window.MNE_CONFIG = Object.assign({
  siteName: 'mnemerch',
  productionHost: 'mnemerch.ru',
  whatsappPhone: '79082198800',
  telegramUrl: 'https://t.me/Tatyana_Arzamastceva',

  // whatsapp: рабочий режим без backend, через заполненное сообщение WhatsApp.
  // api: production-режим после запуска backend /api/lead.
  leadMode: 'whatsapp',
  leadApiUrl: '/api/lead',

  consentStorageKey: 'mnemerch_cookie_consent_v1'
}, window.MNE_CONFIG || {});

/* QuizProductSelector — клиентский подбор товаров для квиза
   Адаптирован из ProductSelectorService платформы (ранжирование по отрасли/типу/бюджету/тиражу) */

var QuizSelector = (function() {

  function clean(s) {
    return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function safeFloat(v) {
    if (v == null || v === '') return null;
    var m = String(v).match(/\d+([.,]\d+)?/);
    if (!m) return null;
    var f = parseFloat(m[0].replace(',', '.'));
    return isNaN(f) ? null : f;
  }

  function safeInt(v) {
    var f = safeFloat(v);
    return f !== null ? Math.round(f) : null;
  }

  function tokenMatch(text, tokens) {
    var t = clean(text);
    if (!t) return 0;
    var count = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].length >= 2 && t.indexOf(tokens[i].toLowerCase()) !== -1) count++;
    }
    return count;
  }

  var INDUSTRY_KEYWORDS = {
    'it':       ['гаджет', 'power', 'заряд', 'кабель', 'электрон', 'худи', 'свитшот', 'наушник', 'флеш', 'welcome'],
    'финансы':  ['преми', 'ручк', 'ежеднев', 'блокнот', 'аксессуар', 'набор', 'кожа', 'металл', 'офис', 'статус'],
    'ритейл':   ['сумк', 'шопер', 'пакет', 'промо', 'текстил', 'упаковк', 'пак', 'коробк'],
    'производство': ['термос', 'бутыл', 'сумк', 'рюкзак', 'рабоч', 'фонар', 'мультитул', 'outdoor'],
    'медицина': ['ручк', 'ежеднев', 'блокнот', 'сумк', 'текстил', 'санитар', 'часы'],
  };

  var TYPE_CATEGORY_MAP = {
    'одежда':      ['текстиль', 'одежд', 'футболк', 'толстовк', 'свитшот', 'худи', 'кепк', 'шарф'],
    'посуда':      ['кружк', 'термос', 'термокружк', 'бутыл', 'еда', 'напитк', 'стакан', 'посуда'],
    'промо':       ['ручк', 'промо', 'брелок', 'значк', 'зеркал', 'зажигал', 'флажк'],
    'подарки':     ['подар', 'набор', 'набор', 'новогод', 'преми', 'коробк'],
    'электроника': ['power', 'банк', 'заряд', 'наушник', 'флеш', 'кабель', 'гаджет', 'электрон'],
  };

  function industryScore(product, industry) {
    if (!industry) return 0;
    var tokens = INDUSTRY_KEYWORDS[industry.toLowerCase()];
    if (!tokens) return 0;
    var blob = productText(product);
    return Math.min(30, tokenMatch(blob, tokens) * 10);
  }

  function typeScore(product, productType) {
    if (!productType) return 0;
    var keywords = TYPE_CATEGORY_MAP[productType.toLowerCase()];
    if (!keywords) return 0;
    var blob = productText(product);
    return Math.min(50, tokenMatch(blob, keywords) * 12);
  }

  function productText(product) {
    var parts = [
      product.name, product.category, product.subcategory,
      product.description, product.material, product.color,
      product.price_segment, product.supplier
    ];
    if (product.tags) parts = parts.concat(product.tags);
    if (product.printing_methods) parts = parts.concat(product.printing_methods);
    return parts.filter(Boolean).map(clean).join(' ');
  }

  function budgetScore(product, budgetPerUnit) {
    var price = safeFloat(product.price);
    if (budgetPerUnit == null || price == null || price <= 0) return 0;
    var ratio = price / budgetPerUnit;
    if (ratio <= 0.7) return 15;
    if (ratio <= 1.0) return 10;
    if (ratio <= 1.15) return -10;
    if (ratio <= 1.4) return -30;
    return -60;
  }

  function quantityScore(product, quantity) {
    var minQ = safeInt(product.min_quantity);
    if (minQ == null) return 5;
    if (quantity == null) return minQ <= 100 ? 3 : 0;
    if (minQ <= quantity) return 10;
    return -20;
  }

  function qualityScore(product) {
    var score = 0;
    if (product.image_local || product.image_thumb || product.image_url) score += 15;
    if (product.price != null && product.price > 0) score += 10;
    if (product.description) score += 5;
    if (product.printing_methods && product.printing_methods.length > 0) score += 5;
    return score;
  }

  /* Основная функция: принимает ответы квиза, возвращает топ-N товаров */
  function select(products, quizAnswers, count) {
    count = count || 4;
    var industry = clean(quizAnswers.industry || '');
    var productType = clean(quizAnswers.productType || '');
    var quantity = safeInt(quizAnswers.quantity);
    var budgetPerUnit = safeFloat(quizAnswers.budgetPerUnit);

    var scored = [];
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var score = 0;
      score += industryScore(p, industry) * 1.5;
      score += typeScore(p, productType) * 2;
      score += budgetScore(p, budgetPerUnit);
      score += quantityScore(p, quantity);
      score += qualityScore(p);
      scored.push({ product: p, score: score });
    }

    scored.sort(function(a, b) { return b.score - a.score; });

    var result = [];
    var seenCats = {};
    for (var i = 0; i < scored.length && result.length < count; i++) {
      var item = scored[i];
      var cat = (item.product.category || 'other').toLowerCase();
      if (!seenCats[cat]) {
        seenCats[cat] = 0;
      }
      if (seenCats[cat] >= 3) continue;
      seenCats[cat]++;
      result.push(item.product);
    }

    return result;
  }

  return { select: select };
})();

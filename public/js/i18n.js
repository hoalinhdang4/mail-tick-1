// Lightweight i18n runtime: pick language, apply translations from window.LOCALES
(function () {
  var supported = ['en','ko','de','fr','it','es','pt','th','ja','zh','nl','da','ar','uk'];

  function pickLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var urlLang = (params.get('lang') || '').toLowerCase();
      if (supported.includes(urlLang)) return urlLang;
    } catch (_) {}
    try {
      var prefer = (localStorage.getItem('preferredLang') || '').toLowerCase();
      if (supported.includes(prefer)) return prefer;
    } catch (_) {}
    var navs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
    for (var i = 0; i < navs.length; i++) {
      var base = String(navs[i] || '').split('-')[0].toLowerCase();
      if (supported.includes(base)) return base;
    }
    return 'en';
  }

  function t(lang, key) {
    try {
      var dict = (window.LOCALES && window.LOCALES[lang]) || (window.LOCALES && window.LOCALES.en) || {};
      return dict[key] || (window.LOCALES && window.LOCALES.en && window.LOCALES.en[key]) || key;
    } catch (_) {
      return key;
    }
  }

  function assetFor(lang, key) {
    try {
      var table = (window.LOCALE_ASSETS && (window.LOCALE_ASSETS[lang] || window.LOCALE_ASSETS.en)) || {};
      return table[key] || '';
    } catch (_) {
      return '';
    }
  }

  function applyTextTranslations(lang) {
    try {
      document.title = t(lang, '_title');
      var nodes = document.querySelectorAll('[data-i18n]');
      nodes.forEach(function (node) {
        var key = node.getAttribute('data-i18n');
        node.textContent = t(lang, key);
      });
    } catch (_) {}
  }

  function applyAttrTranslations(lang) {
    try {
      var nodes = document.querySelectorAll('[data-i18n-attr]');
      nodes.forEach(function (node) {
        var map = node.getAttribute('data-i18n-attr');
        if (!map) return;
        map.split(';').forEach(function (pair) {
          var parts = pair.split(':');
          if (parts.length === 2) {
            var attr = parts[0].trim();
            var key = parts[1].trim();
            var val = t(lang, key);
            try { node.setAttribute(attr, val); } catch (_) {}
          }
        });
      });
    } catch (_) {}
  }

  function applyImageTranslations(lang) {
    try {
      var imgs = document.querySelectorAll('[data-i18n-img]');
      imgs.forEach(function (img) {
        var key = img.getAttribute('data-i18n-img');
        var src = assetFor(lang, key);
        if (src) img.setAttribute('src', src);
      });
      var bgs = document.querySelectorAll('[data-i18n-bg]');
      bgs.forEach(function (el) {
        var key = el.getAttribute('data-i18n-bg');
        var url = assetFor(lang, key);
        if (url) el.style.backgroundImage = 'url(' + url + ')';
      });
    } catch (_) {}
  }

  var lang = pickLang();
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  window.currentLang = lang;
  window.I18N = { t: function (key) { return t(lang, key); }, lang: lang };
  requestAnimationFrame(function () {
    applyTextTranslations(lang);
    applyAttrTranslations(lang);
    applyImageTranslations(lang);
  });
})();
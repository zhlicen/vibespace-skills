/* ops-dashboard-design · i18n scaffold (zero-build, framework-free)
 *
 * Load this BEFORE your app.js. Pattern:
 *   - one flat dictionary per language, keys are dotted paths
 *   - t(key, params) looks up + interpolates {param}
 *   - static HTML uses data-i18n / data-i18n-placeholder / data-i18n-title
 *   - dynamic (JS-rendered) strings call t() at render time
 *   - switching language re-runs applyI18n() + your renderAll()
 *
 * RULE  Do NOT translate data: model names, user names/IDs, raw error text,
 *       dates, numbers, currency. Only translate UI chrome.
 * RULE  The BACKEND must never emit user-facing sentences. It returns codes +
 *       params (e.g. {code:'error_surge', params:{...}}); templates live here.
 * RULE  t() falls back to the key itself when missing, so untranslated strings
 *       show up as visible "some.key" text — grep for those before shipping.
 */

window.I18N = {
  en: {
    appTitle: 'Ops Dashboard',
    common: { all: 'All', other: 'Other', none: '—', empty: 'No data' },
    // ... add your keys, grouped by area (nav, kpi, table headers, alerts, ...)
  },
  zh: {
    appTitle: '运营看板',
    common: { all: '全部', other: '其它', none: '—', empty: '暂无数据' },
    // ... zh mirror of every en key
  },
};

function t(key, params) {
  const dict = window.I18N[window.LANG] || window.I18N.en;
  let s = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (s == null) s = key;                       // visible fallback = the key
  if (params) for (const k in params) s = String(s).replaceAll('{' + k + '}', params[k]);
  return s;
}
window.t = t;

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.title = t('appTitle');
  document.documentElement.lang = (window.LANG === 'zh' ? 'zh-CN' : 'en');
}
window.applyI18n = applyI18n;

function updateLangBtn(lang) {
  const b = document.getElementById('langToggle');
  if (b) b.textContent = (lang === 'zh' ? 'EN' : '中');   // shows the OTHER language
}
window.updateLangBtn = updateLangBtn;

function setLang(lang) {
  window.LANG = lang;
  localStorage.setItem('lang', lang);
  applyI18n();
  if (typeof renderAll === 'function' && window.DATA) renderAll(); // re-render dynamic content + charts
  updateLangBtn(lang);
}
window.setLang = setLang;

/* init: saved preference > browser language > default 'en' */
(function initLang() {
  const saved = localStorage.getItem('lang');
  if (saved) { window.LANG = saved; return; }
  const b = (navigator.language || '').toLowerCase();
  window.LANG = b.startsWith('zh') ? 'zh' : 'en';
})();

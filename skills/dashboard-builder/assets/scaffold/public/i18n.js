/* i18n for the dashboard chrome. The dashboard's working language comes from the
 * server (payload.lang), which mirrors project.json.workingLanguage.
 * Only UI chrome is translated here — metric labels come from the data/columnMap
 * and are shown as-is in whatever language the user wrote them.
 * Add more languages by adding a key block; t() falls back to the key if missing.
 */
window.I18N = {
  en: {
    appTitle: 'Dashboard',
    hdr: { dark: 'Toggle dark mode', lang: 'Switch language', refresh: 'Refresh' },
    common: { asOf: 'Data as of', empty: 'No data', loading: 'Loading…', error: 'Failed to load data', other: 'Other' },
  },
  zh: {
    appTitle: '数据看板',
    hdr: { dark: '切换暗黑模式', lang: '切换语言', refresh: '刷新' },
    common: { asOf: '数据截止', empty: '暂无数据', loading: '加载中…', error: '加载数据失败', other: '其它' },
  },
};

function t(key) {
  const base = (window.LANG || 'en').startsWith('zh') ? 'zh' : 'en';
  const dict = window.I18N[base] || window.I18N.en;
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  return v == null ? key : v;
}
window.t = t;

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.title = t('appTitle');
  document.documentElement.lang = (window.LANG || 'en');
}
window.applyI18n = applyI18n;

function setLang(lang) {
  window.LANG = lang;
  localStorage.setItem('lang', lang);
  applyI18n();
  const b = document.getElementById('langToggle');
  if (b) b.textContent = lang.startsWith('zh') ? 'EN' : '中';
  if (typeof window.renderAll === 'function' && window.DATA) window.renderAll();
}
window.setLang = setLang;

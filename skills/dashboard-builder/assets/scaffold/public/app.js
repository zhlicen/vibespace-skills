'use strict';
// Generic renderer. Consumes /api/dashboard -> { kpis, charts, tables, warnings, asOf, lang }.
// Renders KPI cards, charts (line/bar/ranking/doughnut), and tables using the design tokens.
// All chart colors are read from CSS variables so charts follow light/dark automatically.

const $ = (id) => document.getElementById(id);
const charts = []; // live Chart.js instances, for theme re-render

function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function palette() { return ['--c1','--c2','--c3','--c4','--c5','--c6','--c7','--c8'].map(cssVar); }

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

function fmt(v, format) {
  if (v == null || isNaN(v)) return '—';
  if (format === 'percent') return (v * 100).toFixed(1) + '%';
  if (format === 'currency') return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // number: abbreviate large magnitudes
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (abs >= 1e4) return (v / 1e3).toFixed(1) + 'K';
  return Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function baseOpts() {
  const grid = cssVar('--divider'), tick = cssVar('--muted');
  return {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { grid: { color: grid }, ticks: { color: tick } },
      y: { grid: { color: grid }, ticks: { color: tick } },
    },
    plugins: { legend: { labels: { color: cssVar('--sub') } } },
  };
}

function makeChart(canvas, spec) {
  const accent = cssVar('--accent'), pal = palette();
  let cfg;
  if (spec.type === 'line') {
    cfg = { type: 'line', data: { labels: spec.labels, datasets: [{ data: spec.data, borderColor: accent, backgroundColor: accent + '22', tension: .3, fill: true, pointRadius: 2 }] },
      options: { ...baseOpts(), plugins: { legend: { display: false } } } };
  } else if (spec.type === 'ranking') {
    cfg = { type: 'bar', data: { labels: spec.labels, datasets: [{ data: spec.data, backgroundColor: accent }] },
      options: { ...baseOpts(), indexAxis: 'y', plugins: { legend: { display: false } } } };
  } else if (spec.type === 'doughnut') {
    cfg = { type: 'doughnut', data: { labels: spec.labels, datasets: [{ data: spec.data, backgroundColor: spec.labels.map((_, i) => pal[i % pal.length]) }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: cssVar('--sub') } } } } };
  } else { // bar (vertical)
    cfg = { type: 'bar', data: { labels: spec.labels, datasets: [{ data: spec.data, backgroundColor: accent }] },
      options: { ...baseOpts(), plugins: { legend: { display: false } } } };
  }
  charts.push(new Chart(canvas.getContext('2d'), cfg));
}

function renderAll() {
  const d = window.DATA;
  if (!d) return;
  charts.splice(0).forEach((c) => c.destroy());

  // KPIs
  $('kpiRow').innerHTML = (d.kpis || []).map((k) =>
    '<div class="card"><div class="kpi-label">' + esc(k.label) + '</div>'
    + '<div class="kpi-value tnum">' + fmt(k.value, k.format) + (k.unit ? ' <span style="font-size:14px;color:var(--muted);">' + esc(k.unit) + '</span>' : '') + '</div></div>'
  ).join('');

  // Charts
  $('charts').innerHTML = (d.charts || []).map((c, i) =>
    '<div class="card"><div class="ctitle">' + esc(c.label) + '</div>'
    + '<div style="height:280px;"><canvas id="cnv' + i + '"></canvas></div></div>'
  ).join('');
  (d.charts || []).forEach((c, i) => {
    if (!c.labels || !c.labels.length) { $('cnv' + i).parentElement.innerHTML = '<div style="color:var(--muted);padding:40px 0;text-align:center;">' + t('common.empty') + '</div>'; return; }
    makeChart($('cnv' + i), c);
  });

  // Tables
  $('tables').innerHTML = (d.tables || []).map((tb) =>
    '<div class="card" style="margin-bottom:20px;overflow-x:auto;"><div class="ctitle">' + esc(tb.label) + '</div>'
    + '<table><thead><tr>' + tb.columns.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead>'
    + '<tbody>' + tb.rows.map((r) => '<tr>' + r.map((v) => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'
  ).join('');

  $('asOf').textContent = d.asOf ? (t('common.asOf') + ' ' + new Date(d.asOf).toLocaleString()) : '';
}
window.renderAll = renderAll;

async function load() {
  try {
    const r = await fetch('/api/dashboard');
    const d = await r.json();
    if (!r.ok || d.error) throw new Error(d.error || ('HTTP ' + r.status));
    window.DATA = d;
    // server-provided language wins unless the user has explicitly chosen one
    if (!localStorage.getItem('lang') && d.lang) window.LANG = d.lang;
    applyI18n();
    $('stateMsg').style.display = 'none';
    $('content').style.display = '';
    renderAll();
    if (d.warnings && d.warnings.length) console.warn('Data warnings:', d.warnings);
  } catch (e) {
    $('stateMsg').textContent = t('common.error') + ' — ' + e.message;
    $('stateMsg').style.display = '';
    $('content').style.display = 'none';
  }
}

// ---- controls ----
function initDark() {
  const on = localStorage.getItem('dark') === '1';
  document.documentElement.classList.toggle('dark', on);
  $('darkToggle').textContent = on ? '☀️' : '🌙';
}
$('darkToggle').onclick = () => {
  const on = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', on);
  localStorage.setItem('dark', on ? '1' : '0');
  $('darkToggle').textContent = on ? '☀️' : '🌙';
  renderAll(); // re-render charts so axis/grid colors follow the theme
};
$('langToggle').onclick = () => setLang((window.LANG || 'en').startsWith('zh') ? 'en' : 'zh');

// ---- init ----
(function init() {
  const saved = localStorage.getItem('lang');
  const browserZh = (navigator.language || 'en').toLowerCase().startsWith('zh');
  window.LANG = saved || (browserZh ? 'zh' : 'en'); // server payload.lang may override in load()
  initDark();
  $('langToggle').textContent = (window.LANG || 'en').startsWith('zh') ? 'EN' : '中';
  applyI18n();
  load();
})();

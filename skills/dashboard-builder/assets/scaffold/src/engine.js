'use strict';
// Generic aggregation engine: rows[] + columnMap -> dashboard payload.
// This is the paved path — fill columnMap correctly (see reference/metric-inference.md)
// and you usually do not need to write custom code. metrics.js can call this directly.
//
// columnMap entry shapes (keyed by metric id):
//   KPI:        { label, column, agg, format?, unit? }
//   Trend:      { label, column, agg, timeBy, bucket?('day'|'month'|'year'), format? }
//   Breakdown:  { label, column, agg, groupBy, chart?('bar'|'doughnut'), format? }
//   Ranking:    { label, column, agg, groupBy, topN, format? }
//   Table:      { label, block:'table', columns:[...] }
// agg: 'sum' | 'count' | 'avg' | 'max' | 'min'
// format: 'number' | 'currency' | 'percent'  (formatting happens in the frontend)

function toNumber(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  // strip currency symbols, thousands separators, spaces
  const cleaned = String(v).replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const n = Number(cleaned);
  return isFinite(n) ? n : null;
}

function aggregate(values, agg) {
  const nums = values.filter((n) => n != null);
  if (agg === 'count') return values.length;      // count of records (non-null groups counted upstream)
  if (nums.length === 0) return 0;
  switch (agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'max': return Math.max(...nums);
    case 'min': return Math.min(...nums);
    default: return nums.reduce((a, b) => a + b, 0);
  }
}

function bucketKey(dateVal, bucket) {
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d)) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (bucket === 'year') return `${y}`;
  if (bucket === 'month') return `${y}-${m}`;
  return `${y}-${m}-${day}`; // day (default)
}

function inferBlock(spec) {
  if (spec.block) return spec.block;
  if (spec.timeBy) return 'trend';
  if (spec.topN) return 'ranking';
  if (spec.groupBy) return 'breakdown';
  return 'kpi';
}

function computeFromColumnMap(rows, columnMap, opts) {
  opts = opts || {};
  const warnings = [];
  const kpis = [];
  const charts = [];
  const tables = [];

  for (const id of Object.keys(columnMap || {})) {
    const spec = columnMap[id];
    const block = inferBlock(spec);
    const label = spec.label || id;
    const format = spec.format || 'number';

    try {
      if (block === 'table') {
        const cols = spec.columns || Object.keys(rows[0] || {});
        tables.push({ id, label, columns: cols, rows: rows.map((r) => cols.map((c) => r[c])) });
        continue;
      }

      // collect numeric values (with bad-cell reporting) for the measure column
      const measure = spec.column;
      const numAt = (r, i) => {
        if (spec.agg === 'count') return 1; // count doesn't need a numeric measure
        const n = toNumber(r[measure]);
        if (n == null && r[measure] != null && r[measure] !== '') {
          warnings.push(`Row ${i + 2}: "${measure}" value "${r[measure]}" is not a number — skipped`);
        }
        return n;
      };

      if (block === 'kpi') {
        const vals = rows.map(numAt);
        kpis.push({ id, label, value: aggregate(vals, spec.agg), format, unit: spec.unit || null });

      } else if (block === 'trend') {
        const buckets = new Map(); // key -> values[]
        rows.forEach((r, i) => {
          const key = bucketKey(r[spec.timeBy], spec.bucket);
          if (key == null) return;
          if (!buckets.has(key)) buckets.set(key, []);
          buckets.get(key).push(numAt(r, i));
        });
        const keys = [...buckets.keys()].sort();
        charts.push({ id, label, type: 'line', format,
          labels: keys, data: keys.map((k) => aggregate(buckets.get(k), spec.agg)) });

      } else { // breakdown or ranking
        const groups = new Map();
        rows.forEach((r, i) => {
          const g = r[spec.groupBy];
          const key = (g == null || g === '') ? '(blank)' : String(g);
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(numAt(r, i));
        });
        let pairs = [...groups.entries()].map(([k, v]) => [k, aggregate(v, spec.agg)]);
        pairs.sort((a, b) => b[1] - a[1]);
        if (block === 'ranking' && spec.topN) pairs = pairs.slice(0, spec.topN);
        charts.push({ id, label, format,
          type: block === 'ranking' ? 'ranking' : (spec.chart || 'bar'),
          labels: pairs.map((p) => p[0]), data: pairs.map((p) => p[1]) });
      }
    } catch (e) {
      warnings.push(`Metric "${id}" failed: ${e.message}`);
    }
  }

  // one bad cell is seen once per metric that reads its column — dedupe for the user
  const uniqueWarnings = [...new Set(warnings)];
  return { kpis, charts, tables, warnings: uniqueWarnings, asOf: new Date().toISOString() };
}

module.exports = { computeFromColumnMap, toNumber, aggregate };

'use strict';
// Reference only. The live file is metrics.js at the PROJECT ROOT (already shipped).
// This shows the two ways to implement computeMetrics. If you copy Option B into the
// root metrics.js, keep the require path as './src/engine' (root-relative).
//
// It must export:  async function computeMetrics(ds)  ->  { kpis, charts, tables, asOf }
// where `ds` is the data source (has .load() -> rows[] and .columnMap).

// NOTE: path shown as it must appear in the ROOT metrics.js:
const { computeFromColumnMap } = require('./src/engine');

// ---- Option A (default, recommended): let the engine do everything from columnMap ----
async function computeMetrics(ds) {
  const rows = await ds.load();
  return computeFromColumnMap(rows, ds.columnMap, {});
}

// ---- Option B: custom logic when a metric doesn't fit the columnMap model ----
// async function computeMetrics(ds) {
//   const rows = await ds.load();
//   const base = computeFromColumnMap(rows, ds.columnMap, {});
//   // add a hand-computed KPI, e.g. conversion rate:
//   const orders = rows.length;
//   const paid = rows.filter((r) => r.Status === 'paid').length;
//   base.kpis.push({ id: 'conversion', label: 'Conversion rate',
//     value: orders ? paid / orders : 0, format: 'percent' });
//   return base;
// }

module.exports = { computeMetrics };

'use strict';
// Default metrics implementation (lives at PROJECT ROOT). The agent edits this in Stage 5.
// It must export:  async function computeMetrics(ds)  ->  { kpis, charts, tables, asOf }
// `ds` has .load() -> rows[] and .columnMap.
//
// Default behavior: drive everything from datasource.json's columnMap via the engine.
// For custom metrics that don't fit the columnMap model, see src/metrics.example.js (Option B).

const { computeFromColumnMap } = require('./src/engine');

async function computeMetrics(ds) {
  const rows = await ds.load();
  return computeFromColumnMap(rows, ds.columnMap, { lang: ds.lang });
}

module.exports = { computeMetrics };

'use strict';
// Data source factory. Returns a uniform source with .load() -> rows[] (array of
// plain objects), plus .columnMap. DB sources also expose .ping() for Stage 4 verify.
const { createExcelSource } = require('./excel');
const { createDbSource } = require('./db');

function createSource(cfg, env) {
  const type = (cfg && cfg.type) || 'excel';
  switch (type) {
    case 'excel':
    case 'csv':
      return createExcelSource(cfg);       // xlsx reads .csv too
    case 'postgres':
    case 'mysql':
      return createDbSource(cfg, env);
    default:
      throw new Error(`Unsupported data source type: ${type}`);
  }
}

module.exports = { createSource };

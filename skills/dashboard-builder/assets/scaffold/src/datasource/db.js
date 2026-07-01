'use strict';
// Database adapter (PostgreSQL or MySQL). Read-only.
// v1 strategy: load rows from a base query/table into memory, then the shared
// engine aggregates in JS — one aggregation path for all sources. Fine for the
// modest internal datasets this tool targets; not for very large tables.
//
// Requires the matching driver installed: 'pg' for postgres, 'mysql2' for mysql.
// The connection string is read from .env (never hard-coded here).

function createDbSource(cfg, env) {
  const type = cfg.type; // 'postgres' | 'mysql'
  const connKey = (cfg.env && cfg.env.connKeys && cfg.env.connKeys[0]) || 'DB_URL';
  const connStr = env[connKey];
  if (!connStr) throw new Error(`Missing ${connKey} in .env for the database connection`);

  // Base query: explicit query wins; else SELECT * FROM <table>.
  const baseQuery = cfg.query || (cfg.table ? `SELECT * FROM ${cfg.table}` : null);
  if (!baseQuery) throw new Error('datasource.json needs a "table" or "query" for a database source');

  return {
    columnMap: cfg.columnMap || {},

    // used by Stage 4 verify: a trivial read-only check
    async ping() {
      if (type === 'postgres') {
        const { Client } = require('pg');
        const c = new Client({ connectionString: connStr });
        await c.connect(); await c.query('SELECT 1'); await c.end();
      } else if (type === 'mysql') {
        const mysql = require('mysql2/promise');
        const c = await mysql.createConnection(connStr);
        await c.query('SELECT 1'); await c.end();
      } else {
        throw new Error(`Unknown db type: ${type}`);
      }
      return true;
    },

    async load() {
      if (type === 'postgres') {
        const { Client } = require('pg');
        const c = new Client({ connectionString: connStr });
        await c.connect();
        try { const res = await c.query(baseQuery); return res.rows; }
        finally { await c.end(); }
      } else if (type === 'mysql') {
        const mysql = require('mysql2/promise');
        const c = await mysql.createConnection(connStr);
        try { const [rows] = await c.query(baseQuery); return rows; }
        finally { await c.end(); }
      }
      throw new Error(`Unknown db type: ${type}`);
    },
  };
}

module.exports = { createDbSource };

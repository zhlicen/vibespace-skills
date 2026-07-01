'use strict';
// Local dashboard server. Serves the static frontend and one JSON endpoint.
// Read-only, localhost only. No auth, no external ports — this is a local tool.
const path = require('path');
const express = require('express');
const config = require('./config');
const { createSource } = require('./src/datasource');

// metrics.js lives at the project root (shipped default; the agent edits it in Stage 5).
let computeMetrics;
try { ({ computeMetrics } = require('./metrics')); }
catch (e) {
  console.error('Could not load ./metrics.js —', e.message);
  process.exit(1);
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', async (req, res) => {
  try {
    const ds = createSource(config.dataSource, config.env);
    ds.columnMap = config.columnMap;
    ds.lang = config.lang;
    const payload = await computeMetrics(ds);
    payload.lang = config.lang;
    res.json(payload);
  } catch (err) {
    // plain, safe error — never leak secrets or stack to the browser
    console.error('[dashboard] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(config.port, '127.0.0.1', () => {
  console.log(`Dashboard running at http://localhost:${config.port}`);
});

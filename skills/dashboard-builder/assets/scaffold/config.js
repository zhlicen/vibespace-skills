'use strict';
// Central config: merges project.json (metadata) + datasource.json (mapping) + .env (secrets).
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch (e) { return fallback; }
}

const project = readJSON('project.json', {});
const datasource = readJSON('datasource.json', {});

module.exports = {
  port: Number(process.env.PORT || 3200),
  lang: project.workingLanguage || 'en',
  dataSource: datasource,            // { type, file, sheet, columnMap, ... }
  columnMap: datasource.columnMap || {},
  env: process.env,                  // secrets live here, never logged
};

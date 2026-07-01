'use strict';
// Excel / CSV adapter. Loads a workbook and returns rows as plain objects.
// Uses SheetJS (xlsx). Dates are parsed to JS Date objects (cellDates).
const path = require('path');
const XLSX = require('xlsx');

function createExcelSource(cfg) {
  return {
    columnMap: cfg.columnMap || {},
    // Load all rows from the configured sheet into memory.
    async load() {
      const file = path.join(process.cwd(), cfg.file);
      const wb = XLSX.readFile(file, { cellDates: true });
      const sheetName = cfg.sheet || wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${cfg.file}`);
      // defval:null keeps empty cells present; raw:true keeps numbers as numbers.
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
      // drop fully-empty rows
      return rows.filter((r) => Object.values(r).some((v) => v !== null && v !== ''));
    },
  };
}

module.exports = { createExcelSource };

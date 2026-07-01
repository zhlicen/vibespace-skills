# Metric inference — reading columns into metrics

How to look at a spreadsheet or table and propose metrics (Stage 1) and map columns to them (Stage 4). Heuristics, not rules — always confirm with the user in plain language.

## Step 1: classify each column

Read the header + a sample of ~20 rows. Classify:

| Signal | Likely role | Typical use |
|--------|-------------|-------------|
| Mostly numbers, varying | **Measure** | sum / avg — the thing you total |
| Date/time strings or serials | **Time dimension** | trend x-axis, period filter |
| Repeating short text (few distinct values) | **Category dimension** | breakdown / ranking group |
| High-cardinality text/IDs | **Entity** | ranking rows (top-N), or ignore |
| Money-formatted (¥ $ , .00) | **Currency measure** | sum, format as currency |
| 0/1, yes/no, true/false | **Flag** | count of "yes", rate |

## Step 2: propose metrics from the classification

- One **Measure** + total → a KPI (`sum`). Its change over the **Time dimension** → a trend line.
- **Measure** grouped by a **Category** → a breakdown (bar/doughnut).
- **Measure** grouped by an **Entity**, sorted desc, top 10 → a ranking.
- **Flag** → count or rate KPI.
- Count of rows → a volume KPI (`count`).

Present these as the Stage 1 draft. Let the user cut/add.

## Step 3: aggregation choice

Default aggregation per measure:
- Amounts / counts that should total → `sum`
- Rates, scores, prices where totaling is meaningless → `avg`
- "How many records" → `count`
- "Latest / peak" → `max`; "floor" → `min`

When unsure between `sum` and `avg`, ask the user in plain language: "Do you want the **total** of X, or the **average** X?"

## Step 4: write the column map

In `datasource.json`:
```json
"columnMap": {
  "revenue_total":   { "column": "Amount",  "agg": "sum" },
  "orders_count":    { "column": "OrderID", "agg": "count" },
  "revenue_by_region": { "column": "Amount", "agg": "sum", "groupBy": "Region" },
  "top_products":    { "column": "Amount", "agg": "sum", "groupBy": "Product", "topN": 10 },
  "daily_revenue":   { "column": "Amount", "agg": "sum", "timeBy": "Date", "bucket": "day" }
}
```
Keys are the metric IDs from the PRD. `groupBy` / `timeBy` / `topN` / `bucket` are optional modifiers.

## Common data messiness (handle, don't crash)

- **Mixed types in a measure column** (numbers with stray text) → coerce; skip the bad cell and report the row number to the user in plain language.
- **Dates as Excel serial numbers** → convert (the Excel adapter handles this).
- **Blank rows / trailing empty rows** → drop.
- **Thousands separators / currency symbols in text cells** → strip before parsing.
- **Inconsistent category spelling** ("US" vs "USA") → surface to the user; do not silently merge.

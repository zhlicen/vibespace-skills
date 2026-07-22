---
name: dashboard-builder
description: >-
  Use when a (often non-technical) user wants to turn their own data — a local
  Excel/CSV file or a database — into a running, good-looking dynamic dashboard
  on their own Windows or Mac computer. Drives the whole flow end to end:
  environment bootstrap (portable Node, no admin), guided requirements interview
  in the user's language, PRD, design sign-off, data-source wiring, metric
  implementation, local run, and handoff. Runs under any capable coding agent
  (not just Claude Code). Local run only — no production deployment.
---

# Dashboard Builder

A **step-by-step runbook** that any coding agent follows to build a running dashboard on the user's own machine, starting from nothing installed.

The target user may be **non-technical** ("I have a spreadsheet and want a live dashboard for my boss"). You (the agent) do all the technical work. Never ask the user a technical question you can answer or decide yourself.

> This playbook is agent-agnostic. Do not assume Claude-Code-specific tools exist. Everything is done with **shell commands + file reads/writes**, which every capable coding agent has.

---

## 0. How this playbook works (read first, every time)

**The project folder is the source of truth, not your memory.** Two state files carry everything across turns and even across different agents:

- `project.json` — machine-readable config: working language, scaffold version, data source, and the **current stage**. You read this first, always.
- `PROGRESS.md` — human-readable log: what is done, decisions made, open questions.

**Every time you are invoked, do this before anything else:**

1. Look for `project.json` in the working directory (and one level down).
2. **If it exists** → read it. Read `PROGRESS.md` too. Announce to the user, in the language stored in `project.json` → `workingLanguage`: "Resuming at stage N: <name>." Then jump to that stage below.
3. **If it does not exist** → this is a new project. Go to **Stage 0 (Preflight)**.

**After finishing any stage**, before you stop or move on, you MUST:
- Update `project.json` → `stage` to the next stage number.
- Append a dated line to `PROGRESS.md` describing what was decided.
- If a stage ends at a **GATE** (user sign-off), stop and wait for the user. Do not proceed past a GATE on your own.

---

## ABSOLUTE RULES (do not break these)

1. **Never run a stage out of order.** The stages are a pipeline. Each depends on the file the previous one wrote.
2. **Stop at every GATE.** A GATE means "show the user, get an explicit yes, then continue." Never assume yes.
3. **Never install anything system-wide and never require admin/sudo** for Node. Use the portable Node in `./runtime/` (Stage 0). The only exception is a database driver the user's IT may need to help with (Stage 4) — and even that is a normal `npm install`, no admin.
4. **Secrets never enter the chat.** Database passwords/keys go only into the local `.env` file. Do not ask the user to paste a password into the conversation; tell them to type it into `.env`, or have their IT do it. Never print `.env` contents back.
5. **This is local-run only.** Do not deploy, do not push to any server, do not open any public port.
6. **Talk to the user in `workingLanguage`.** All conversation, questions, and generated documents (research.md, prd.md, the dashboard UI labels) use the working language. This file and all code/comments stay in English.
7. **Verify every technical step** with the check given in that step before telling the user it worked. If a check fails, go to that step's ON-ERROR, do not push forward.
8. **When unsure, ask the user in plain, non-technical language** — but only about their data and what they want to see, never about tooling.

---

## Stage 0 — Preflight (environment + language)

**GOAL:** A known-good local Node runtime and the user's working language, recorded in `project.json`.

### 0.1 Check that you (the agent) can run shell commands
Run this harmless command:
- Windows (PowerShell): `echo hello`
- Mac (bash/zsh): `echo hello`

If you cannot run shell commands at all, STOP and tell the user (in their language, or English if unknown): *"This agent can't run commands on your computer, so it can't build the dashboard. Please ask your IT to set up an agent that can run terminal commands."* Do not continue.

### 0.2 Detect the operating system
- If the shell is PowerShell / `cmd`, or `$env:OS` is `Windows_NT` → **Windows**.
- If `uname` returns `Darwin` → **Mac**.
- Anything else → tell the user only Windows and Mac are supported right now, and stop.

### 0.3 Ask the working language (FIRST user-facing question)
Ask, in simple English + Chinese so anyone can answer:

> "What language should I use to talk with you and label the dashboard? / 我该用什么语言跟你交流并标注看板？（例如：中文 / English / 日本語）"

Store the answer. From now on, speak that language.

### 0.4 Create the project skeleton
Create these in the working directory if missing:
```
project.json      (from assets/project.json, filled in — see below)
PROGRESS.md       (from assets/PROGRESS.md)
data/             (empty folder; the user's Excel/CSV will go here)
.env              (empty file; add a line ".env" to .gitignore if a .gitignore exists)
```
Fill `project.json` now with at least:
```json
{
  "scaffoldVersion": "1",
  "workingLanguage": "<the user's answer, e.g. zh-CN>",
  "os": "<windows|mac>",
  "stage": 0,
  "dataSource": null,
  "createdAt": "<current date if you know it, else null>"
}
```

### 0.5 Install portable Node into ./runtime (no admin)
Copy `assets/preflight.ps1` (Windows) or `assets/preflight.sh` (Mac) into the project and run it:
- Windows: `powershell -ExecutionPolicy Bypass -File preflight.ps1`
- Mac: `bash preflight.sh`

The script: detects CPU architecture, downloads the pinned Node build, unpacks it into `./runtime/`, and prints the path to the `node` binary.

**VERIFY:** run the node it printed with `--version`, e.g.
- Windows: `.\runtime\node-v22.11.0-win-x64\node.exe --version`
- Mac: `./runtime/node-v22.11.0-darwin-arm64/bin/node --version`

It must print a version like `v22.11.0`. Record the exact node path in `project.json` → `nodePath`.

**ON-ERROR (download blocked / corporate proxy / no internet):** Tell the user, in their language: *"I couldn't download the runtime automatically — your network may be restricted. Please ask your IT to either allow downloads from nodejs.org, or install Node.js 22 for you once. This is the only step that may need IT."* Then stop until resolved.

### 0.6 GATE
Tell the user, in their language: "Setup is ready. Next I'll ask a few questions about what you want to see. Ready?" On yes → set `stage` to 1, log it, go to Stage 1.

---

## Stage 1 — Discovery (guided interview)

**GOAL:** `research.md` — a metric list the user has confirmed, in their language.

**Read `reference/methodology.md` before this stage.** It gives the interview frame and the five dashboard block types.

### 1.1 Propose a first draft BEFORE asking open questions
Non-technical users answer a draft far more easily than a blank question. If a data file is already in `data/`, open it (read headers + a few rows) and infer candidate metrics using `reference/metric-inference.md`. If no file yet, propose a typical dashboard for their stated domain.

Present, in their language: *"Based on this, here is what I think your boss would want to see — tell me what to add, remove, or change:"* then a short list grouped as **big numbers (KPIs) · trends · breakdowns · rankings · alerts**.

### 1.2 Guided questions (only the three that matter)
Ask, in plain language:
1. **Who looks at this, and what decision do they make from it?**
2. **How often do they look?** (drives refresh: static / daily / live)
3. **What one number, if it moved, would they care about most?** (the headline KPI)

### 1.3 Write research.md
Record: audience, key decision, refresh need, the confirmed metric list (each metric = name + plain description + which data it needs). Write it in the working language.

### 1.4 GATE
Show `research.md`. Get explicit confirmation. On yes → `stage` 2, log, go to Stage 2.

---

## Stage 2 — PRD (lock scope)

**GOAL:** `prd.md` — the agreed scope, so later stages don't drift.

Consolidate `research.md` into a short PRD (working language): purpose, audience, the final metric list (numbered), the data needed for each, refresh behavior, and an explicit **"not in v1"** list. Keep it under one page.

**GATE:** Show `prd.md`. On yes → `stage` 3, log, go to Stage 3.

---

## Stage 3 — Design (look & feel sign-off)

**GOAL:** `design.html` — a static mockup with fake numbers the user approves before any data wiring.

**Apply the `ops-dashboard-design` skill** for all visual decisions (tokens, dark mode, layout, component patterns). The dashboard-builder scaffold already vendors the needed design assets under `assets/scaffold/public/`; for this stage, copy only `assets/scaffold/public/tokens.css` and `assets/scaffold/public/i18n.js` next to `design.html` (or reference those files directly with stable relative paths). Stage 6 materializes the full runnable scaffold later.

1. Build `design.html`: header + the KPI/chart/table blocks from the PRD, filled with **obvious fake sample data**, using the copied design tokens. Include the dark-mode toggle and language handling.
2. Open it for the user (print the file path and, if you can, open it in the browser).
3. Default to the opinionated style — do NOT offer a style picker. Only adjust primary color / density if asked.

**GATE:** "Do you like how it looks?" Iterate until yes. On yes → `stage` 4, log, go to Stage 4.

---

## Stage 4 — Data source (wire the real data)

**GOAL:** `datasource.json` (+ secrets in `.env`) describing where data comes from and how columns map to the PRD metrics.

### 4.1 Pick the type (ask in plain language)
- **Excel / CSV file** (recommended, default): "Put your file in the `data/` folder and tell me its name." Then read headers and map columns to metrics.
- **Database**: only if the user has one. **The connection string / password is entered by the user (or their IT) directly into `.env`** — never via chat. You write the non-secret parts (host, port, db name, which tables/queries) into `datasource.json`.

Read `reference/metric-inference.md` for column→metric mapping heuristics.

### 4.2 Write datasource.json
```json
{
  "type": "excel",                     // or "csv" | "postgres" | "mysql"
  "file": "data/sales.xlsx",           // for excel/csv
  "sheet": "Sheet1",
  "env": { "connKeys": ["DB_URL"] },   // for db: names of vars the user set in .env
  "columnMap": { "<metricId>": { "label": "<working-language label>", "column": "...", "agg": "sum|count|avg|max|min" } }
}
```

### 4.3 VERIFY the connection
- Excel/CSV: confirm the file exists and the mapped columns are present; print the first 3 rows back to the user for a sanity check.
- DB: run one trivial read-only query (e.g. `SELECT 1`) using the scaffold's db adapter. If it fails, ON-ERROR: show the plain-language error from `reference/troubleshooting.md`; the fix is almost always a wrong value in `.env` — ask the user/IT to correct `.env`, never print it.

**GATE:** "Is this the right data?" On yes → `stage` 5, log, go to Stage 5.

---

## Stage 5 — Metric implementation

**GOAL:** `metrics.js` in the project — the code that turns raw data into the dashboard payload.

1. Read `assets/scaffold/src/metrics.example.js` for the exact contract. `metrics.js` must export `async function computeMetrics(ds)` returning:
   ```js
   { kpis: [...], charts: [...], tables: [...], asOf: "<timestamp>" }
   ```
2. Implement one metric at a time, in the order of the PRD. For each: pull from `ds` (the adapter), apply the `agg` from `datasource.json`, format numbers/dates.
3. Keep dashboard chrome (app title, buttons, loading/error/empty states) in the frontend i18n dictionary. Keep business metric labels, chart labels, table titles, and units in `datasource.json` / `metrics.js` as `workingLanguage` text and render them as-is; do not force metric labels through the i18n dictionary.

**VERIFY:** you will run it in Stage 6; do not claim it works yet.

Set `stage` 6, log, go to Stage 6. (No user GATE here — this is internal.)

---

## Stage 6 — Build & run (local)

**GOAL:** The dashboard running in the user's browser.

### 6.1 Materialize the scaffold
If not already present, copy `assets/scaffold/*` into the project (server.js, config.js, package.json, src/, public/ with tokens.css + i18n.js). Wire in the `metrics.js` from Stage 5 and `datasource.json` from Stage 4.

### 6.2 Install dependencies with the portable Node
Use the npm that ships with portable Node (same folder as the node binary). Examples:
- Windows: `.\runtime\node-v22.11.0-win-x64\npm.cmd install`
- Mac: `PATH="$PWD/runtime/node-v22.11.0-darwin-arm64/bin:$PATH" npm install`

Deps are all pure-JS (no compiler needed): `express`, `dotenv`, `xlsx`, and `pg`/`mysql2` only if a DB.

**VERIFY:** `npm install` exits 0 and a `node_modules/` folder appears.

### 6.3 Start the server
- Windows: `.\runtime\node-v22.11.0-win-x64\node.exe server.js`
- Mac: `./runtime/node-v22.11.0-darwin-arm64/bin/node server.js`

**VERIFY:** the server prints a URL (default `http://localhost:3200`). Fetch `http://localhost:3200/api/dashboard` and confirm it returns JSON with your metrics, not an error. Then open the page in the browser.

**ON-ERROR:** map common failures via `reference/troubleshooting.md` (port in use → change `PORT` in `.env`; bad data cell → the adapter skips it and reports the row; module not found → rerun install). Fix, then re-verify.

**GATE:** Show the running dashboard. On approval → `stage` 7, log, go to Stage 7.

---

## Stage 7 — Iterate

Collect feedback in plain language. Route each change to the right stage and re-run:
- "Show a different number / wrong total" → Stage 5 (`metrics.js`).
- "Looks wrong / colors / layout" → Stage 3 design, then reflect in `public/`.
- "Wrong data / new file" → Stage 4.

After each change, re-run Stage 6.3 and VERIFY before telling the user it's fixed. Loop until the user is satisfied, then go to Stage 8.

---

## Stage 8 — Handoff (so the user can run it alone later)

**GOAL:** The user can reopen the dashboard tomorrow with updated data, without an agent.

1. Generate the one-click launcher from `assets/launch.bat` (Windows) or `assets/launch.command` (Mac) into the project root, with the correct node path baked in. On double-click it starts the server and opens the browser.
   - Mac: make it executable (`chmod +x launch.command`).
2. Write a short **README in the working language** covering exactly two things a non-technical user needs:
   - **To update data:** replace the file in `data/` with the same name, then double-click the launcher.
   - **To open the dashboard:** double-click the launcher.
3. Tell the user these two facts in their language. Set `stage` 8 (done), log.

---

## project.json — full field reference

```json
{
  "scaffoldVersion": "1",        // pin; resume follows the project's version, not latest
  "workingLanguage": "zh-CN",    // language for all user-facing text
  "os": "windows",               // windows | mac
  "nodePath": "runtime/node-v22.11.0-win-x64/node.exe",
  "stage": 3,                    // current pipeline stage (0..8)
  "dataSource": { "type": "excel" },  // filled at Stage 4
  "createdAt": null
}
```

## Files in this skill
- `reference/methodology.md` — interview frame + the five block types. Read before Stage 1.
- `reference/metric-inference.md` — column → aggregation heuristics. Read for Stages 1 & 4.
- `reference/troubleshooting.md` — plain-language mapping for common errors.
- `assets/project.json`, `assets/PROGRESS.md` — state-file templates.
- `assets/preflight.ps1`, `assets/preflight.sh` — portable Node bootstrap.
- `assets/launch.bat`, `assets/launch.command` — one-click launcher templates.
- `assets/scaffold/` — the runnable Node dashboard template (server, adapters, frontend wired to ops-dashboard-design).

## Changelog
- v0.1 (2026-07) — initial runbook: preflight/portable-node, guided discovery, PRD, design sign-off, Excel + DB data sources, metric implementation, local run, handoff. Depends on `ops-dashboard-design` for the visual layer.

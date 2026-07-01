# Component patterns

Copy-adapt these. All colors reference `tokens.css` variables. Numbers use `class="tnum"` and a `fmtNum` (K/M) / `fmtUSD` helper.

## KPI card row
A grid of equal cards: label (muted) · big number (`--text` or an accent) · caption (muted). Clickable to jump to a tab. Grid `repeat(N,1fr)`; keep N at 4 or 6 for clean rows — going to 8 looks best as two rows of 4, not 6+2.

```js
'<div class="kpi-card" style="background:var(--card);border-radius:16px;padding:17px 18px;box-shadow:var(--shadow-card);border:1px solid var(--border);cursor:pointer;">'
+ '<div style="font-size:12.5px;color:var(--sub);font-weight:500;">' + label + '</div>'
+ '<div class="tnum" style="font-size:30px;font-weight:700;letter-spacing:-1px;color:' + color + ';margin-top:6px;">' + value + '</div>'
+ '<div style="font-size:11.5px;color:var(--muted);margin-top:5px;">' + sub + '</div></div>'
// color = 'var(--text)' for neutral metrics, or an accent var for meaningful ones
```

## Data table (in a card)
Uppercase muted `<th>`, sortable headers toggle asc/desc, row dividers `--divider`. De-emphasize deleted/anomaly rows with `--row-alt` + reduced opacity. Right-align numeric columns.

## Horizontal bar ranking (Top-N)
Chart.js `indexAxis:'y'`, single accent color, sorted; label ticks via `fmtNum`. Good for "top users / top models by X".

## Doughnut share (Top-6 + Other)
Collapse the long tail into one "Other" slice so the legend stays readable:
```js
function topShare(items){ const s=[...items].sort((a,b)=>b.v-a.v); if(s.length<=7) return s;
  return [...s.slice(0,6), {l:t('common.other'), v:s.slice(6).reduce((a,x)=>a+x.v,0)}]; }
```

## Alert banner + drawer
Banner appears at the top of a view when a rule fires; a bell in the header opens a right-side drawer listing all alerts. Backend returns `{code, level, params}` (no prose); frontend renders title/desc/threshold from templates keyed by `code`, and severity from `level` (`critical`/`warning`/`info`). Light-background banners (cream/pink) must force a dark text color, since `--text` would be light in dark mode and vanish on the light banner.

## Empty / loading / error states
Every chart and table needs an empty state (`t('common.empty')`). On fetch failure, replace the main content with a `--danger` message. Show a "data as of <time>" stamp in the header so stale snapshots aren't misread.

## Header controls
Give every control an explicit uniform height (e.g. 38px) and shared radius; mismatched select vs button heights look broken. Hide controls that don't apply to the active tab (e.g. a time-range selector on a snapshot view that ignores it).

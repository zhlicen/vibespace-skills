---
name: ops-dashboard-design
description: Use when building or restyling a read-only operational, admin, or internal-tool dashboard — data-dense pages with KPIs, charts, and tables. Provides an opinionated Apple-style design system (design tokens, dark mode via CSS variables, an i18n scaffold, a layout skeleton, and component patterns) plus the rules that prevent common dark-mode and internationalization pitfalls. Not for marketing sites or content-heavy pages.
---

# Ops Dashboard Design

> STATUS: DRAFT v0.1 — extracted from a production new-api ops dashboard. Prose still being refined; the `assets/` files are validated and ready to copy.

An opinionated system for **read-only, data-dense internal dashboards**. It optimizes for legibility, calm density, and fast reuse — not visual novelty. Zero-build by default (plain HTML/JS + Chart.js via CDN); the tokens and rules are framework-agnostic if you prefer React/Vue.

## When to use
- Operational / monitoring / admin / cost / health dashboards.
- Internal tools that are mostly KPIs, charts, and tables.
- You want dark mode and/or multi-language without reinventing the plumbing.

Skip for marketing pages, editorial/content sites, or highly bespoke visual work — use a general design skill there.

## How to apply
1. Copy `assets/tokens.css`, `assets/i18n.js`, `assets/skeleton.html` into the project.
2. Build views inside the layout skeleton; render KPIs/charts/tables with the patterns in `reference/components.md`.
3. Follow the RULES below — they are where dashboards usually break.

## Design language
- Apple-style restraint: light surface, generous whitespace, rounded cards (16–18px), **very** subtle shadows. No heavy borders, no drop-shadow drama, no pure black `#000`.
- Neutral chrome + a small semantic accent set. Color carries **meaning** (success/warning/danger), not decoration.
- Tabular numerals; abbreviate large numbers (K/M); format currency and time consistently; every timestamp labeled with its timezone.
- One primary accent (`--accent`, a blue) for links / selection / the main series. Categorical charts use the `--c1..c8` palette.

## RULES (the hard-won ones)

### Color & dark mode
- **Every neutral color is a CSS variable.** Never hardcode a neutral hex (`#1D1D1F`, `#fff`, grays) in markup/JS — it will be invisible or wrong in the other theme. This is the #1 dark-mode bug.
- **Semantic accents stay literal/constant** (`--danger` red reads on both themes). Don't flip them in `.dark`.
- Dark mode = toggle `class="dark"` on `<html>`, persist in `localStorage`, only neutral tokens flip.
- Light-background alert banners must set an explicit dark text color (their background does not flip, so inherited `--text` would vanish).
- Feed chart axis/grid/legend colors from the CSS variables at render time so charts follow the theme too.

### Internationalization
- **The backend must not emit user-facing sentences.** Return `{code, params}`; keep all templates/wording in the frontend dictionary. Otherwise you cannot switch language without a round-trip, and half your strings leak in the wrong language.
- Translate UI chrome only. **Never translate data:** model names, user names/IDs, raw error text, dates, numbers, currency.
- `t(key)` falls back to the key itself, so missing strings appear as literal `some.key` on screen — sweep for those before shipping.
- Switching language re-runs `applyI18n()` (static) + `renderAll()` (dynamic); no backend refetch.
- Default language: saved preference → `navigator.language` → a sensible default.

### Layout & controls
- Sticky header (title · status/"data as of" · action buttons), a segmented tab row with a right-aligned context control (e.g. time range), then card grids.
- KPI grid at 4 or 6 per row; 8 metrics → two rows of 4, never 6+2.
- Chart pairs at `1.5fr / 1fr` (a wide trend + a narrow share) read well.
- Give all header controls a uniform explicit height and shared radius; mismatched select/button heights look broken.
- Hide a control on tabs where it has no effect (e.g. a time-range selector on a snapshot view that ignores it) instead of leaving it inert and misleading.

### States & safety
- Every chart/table has an empty state; the page has a loading and an error state.
- Show a "data as of <time>" stamp so stale snapshots aren't misread.
- Read-only by default: no destructive controls in a monitoring view.
- Never commit secrets, internal hostnames/IPs, or real personal data — desensitize sample data.

## Files
- `assets/tokens.css` — `:root` + `.dark` variables, base styles. Start here.
- `assets/i18n.js` — dictionary + `t()` + `applyI18n()` + `setLang()` + language init.
- `assets/skeleton.html` — header + tabs + card/grid layout shell wired to the tokens.
- `reference/components.md` — KPI card, table, ranking bar, share doughnut, alert banner/drawer, states.

## Changelog
- v0.1 (2026-07) — initial extraction: tokens, dark mode, i18n scaffold, layout skeleton, component catalog.

## TODO (to refine with maintainer)
- Add do/don't visual examples to lock the aesthetic (heavy shadow, pure black, over-saturation).
- Decide whether to ship an optional React variant of the scaffold.
- Consider a one-command scaffold generator.

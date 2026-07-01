# Discovery methodology

How to run Stage 1 with a non-technical user. Goal: a confirmed metric list, reached with as little open-ended questioning as possible.

## Principle: draft first, ask second

A blank "what do you want?" paralyzes non-technical users. Always show a concrete draft and let them react ("add / remove / change"). You infer the draft from their data (if a file exists) or from their stated domain.

## The only three questions that matter

Ask these in plain language, in the working language. Everything else you decide yourself.

1. **Audience & decision** — "Who looks at this, and what do they decide based on it?"
   - Drives what to show. A boss usually wants headline numbers + trend, not detail.
2. **Frequency** — "How often do they look at it?"
   - Once a week → static snapshot is fine. Daily → refresh on open. Constantly → live/auto-refresh.
3. **The headline** — "What single number, if it changed, would they care about most?"
   - This becomes the primary KPI, top-left, biggest.

## The five block types

Every dashboard is built from these. Propose a mix; don't exceed what the PRD needs.

| Block | When to use | Example |
|-------|-------------|---------|
| **Big number (KPI)** | The 2–6 numbers the audience checks first | Total revenue, active users |
| **Trend** | "Is it going up or down over time?" | Daily revenue line, last 30 days |
| **Breakdown** | "What is it made of?" | Revenue by region (bar / doughnut) |
| **Ranking** | "Who/what is top or bottom?" | Top 10 products by sales |
| **Alert** | "Tell me only if something is off" | Flag if any store dropped >20% |

## For the boss as the real audience

The person building this is often not the person reading it. Bias the defaults toward the reader (usually a manager):
- Lead with 3–5 big numbers and one clear trend.
- Show change vs. previous period (▲/▼ with %), not just the raw value.
- Push detail tables lower or behind a tab.
- One headline KPI, visually dominant.

## Output of this stage

`research.md`, in the working language, containing:
- Audience + the decision they make
- Refresh need (static / daily / live)
- Metric list — each item: **name · one-line plain description · which data/columns it needs · block type**

Confirm this list with the user before moving on. It is the input to the PRD.

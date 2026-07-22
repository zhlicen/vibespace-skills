# dashboard-builder

`dashboard-builder` is an end-to-end runbook for turning a user's own Excel,
CSV, or database data into a local dynamic dashboard on Windows or macOS.

It is designed for non-technical users: the agent handles setup, requirements,
design, data wiring, metric implementation, local run, and handoff. The finished
dashboard runs only on the user's machine.

## What it does

- Bootstraps a portable Node.js runtime under the project folder, with no admin
  or system-wide install.
- Interviews the user in their chosen working language.
- Writes `research.md` and `prd.md` before implementation so scope stays clear.
- Builds a static `design.html` mockup for visual sign-off.
- Connects to Excel, CSV, PostgreSQL, or MySQL data sources.
- Implements dashboard metrics and renders KPIs, charts, and tables locally.
- Creates a one-click launcher and a short handoff README for the user.

## Install With A Prompt

Give your coding agent this prompt:

```text
Install the `dashboard-builder` skill from https://github.com/zhlicen/vibespace-skills/tree/master/skills/dashboard-builder for your current agent environment. Copy the full skill folder, including SKILL.md, assets/, reference/, and README.md, into the appropriate user-level Agent Skills directory. Do not copy any runtime project data or secrets. After installation, verify that the skill is discoverable and summarize where it was installed.
```

For a project-local install, use this prompt instead:

```text
Install the `dashboard-builder` skill from https://github.com/zhlicen/vibespace-skills/tree/master/skills/dashboard-builder into this project's local Agent Skills directory. Copy the full skill folder, including SKILL.md, assets/, reference/, and README.md. Do not copy any runtime project data or secrets. After installation, verify that the skill is discoverable for this project.
```

## Example Prompts

```text
$dashboard-builder help me turn this Excel file into a local dashboard
```

```text
$dashboard-builder build a dashboard from the CSV files in this folder
```

```text
$dashboard-builder create a local sales dashboard for my manager from data/sales.xlsx
```

```text
$dashboard-builder resume this dashboard project from project.json
```

## Notes

This skill is local-run only. It should not deploy the dashboard, open public
ports, or put database passwords in chat. Secrets belong only in the local
`.env` file created inside the dashboard project.

See [`SKILL.md`](SKILL.md) for the full workflow and [`reference/`](reference/)
for metric inference, discovery methodology, and troubleshooting guidance.

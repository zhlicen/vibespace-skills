# vibespace-skills

A collection of reusable [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/skills) for building software — each skill is a self-contained folder under `skills/`, loadable by Claude Code / the Claude Agent SDK.

## Skills

| Skill | What it does |
|-------|--------------|
| [`dashboard-builder`](skills/dashboard-builder/) | End-to-end runbook that drives any coding agent to turn a non-technical user's own data (Excel/CSV or a database) into a running dashboard on their own Win/Mac machine: portable-Node bootstrap (no admin), guided requirements interview in the user's language, PRD, design sign-off, data wiring, metric implementation, local run, and handoff. Uses `ops-dashboard-design` for the visual layer. |
| [`ops-dashboard-design`](skills/ops-dashboard-design/) | Opinionated design system for read-only operational / admin / internal-tool dashboards: Apple-style design tokens, dark mode via CSS variables, an i18n scaffold, a layout skeleton, and component patterns — plus the rules that prevent common dark-mode and i18n pitfalls. |
| [`ssh-op-skill`](skills/ssh-op-skill/) | Windows-first SSH operations workspace with favorites, one explicit current connection, cached host facts, safe change logging, private runtime credentials, and reusable local operation skills. |

## How to use a skill

Each skill folder contains a `SKILL.md` with YAML frontmatter (`name`, `description`) and any supporting `assets/` and `reference/` files.

- **Claude Code (personal):** copy a skill folder into `~/.claude/skills/`.
- **Claude Code (project):** copy it into `<project>/.claude/skills/`.
- **Reference only:** read `SKILL.md` and lift the tokens / patterns by hand.

Claude decides when to apply a skill by matching the task against the skill's `description`, so keep descriptions trigger-oriented.

## Repository layout

```
vibespace-skills/
├── README.md
├── LICENSE                 # MIT
├── CONTRIBUTING.md
└── skills/
    └── <skill-name>/
        ├── SKILL.md        # frontmatter + instructions
        ├── assets/         # copy-paste starters (css/js/html)
        └── reference/      # deeper docs loaded on demand
```

## License

MIT — see [LICENSE](LICENSE).

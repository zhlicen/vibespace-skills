# Contributing

## Adding a skill

1. Create `skills/<skill-name>/` (kebab-case, matches the `name` in frontmatter).
2. Write `SKILL.md` starting with YAML frontmatter:
   ```yaml
   ---
   name: your-skill-name
   description: One or two sentences, trigger-oriented — describe WHEN Claude should use this skill, not just what it is.
   ---
   ```
3. Put copy-paste starters in `assets/`, deeper docs in `reference/`.
4. Add a row to the table in the top-level `README.md`.

## Conventions

- **English only** for all skill content — instructions, comments, docs, filenames. (Skills that *teach* multi-language may keep bilingual sample data as a demonstration.)
- Keep `SKILL.md` focused on **rules and judgment**; push long code into `assets/` and `reference/`.
- No secrets, no internal hostnames/IPs/credentials, no real personal data anywhere.
- Prefer opinionated defaults over exhaustive options.
- Each skill notes its own version + changelog at the bottom of `SKILL.md`, since skills drift as you learn.

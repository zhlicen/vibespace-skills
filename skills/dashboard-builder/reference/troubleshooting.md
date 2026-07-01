# Troubleshooting — plain-language error mapping

When a technical step fails, do NOT show the user a stack trace. Diagnose with this table, fix it, re-verify, and tell the user in one plain sentence in their working language.

## Preflight / Node (Stage 0)

| Symptom | Cause | Fix |
|---------|-------|-----|
| Download times out / TLS / 403 | Corporate network blocks nodejs.org | Ask IT to allow nodejs.org **or** install Node 22 once. This is the only IT-needed step. |
| `Expand-Archive`/`tar` fails | Partial download | Delete `runtime/`, re-run the preflight script. |
| `node --version` not found | Extract path differs from expected | List `runtime/` and use the actual folder name; update `nodePath` in project.json. |
| PowerShell "running scripts is disabled" | Execution policy | Run with `powershell -ExecutionPolicy Bypass -File preflight.ps1` (per-process, no system change). |

## Dependencies (Stage 6.2)

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npm install` hangs / registry error | Network / proxy | Ask IT for the internal npm registry, set it once: `npm config set registry <url>`. |
| `Cannot find module 'xxx'` at runtime | Install didn't complete | Re-run `npm install`; confirm `node_modules/` exists. |
| Native build error (`node-gyp`) | A non-pure-JS dep sneaked in | Stick to `express`, `dotenv`, `xlsx`, `pg`, `mysql2` — all pure JS. Remove the offending dep. |

## Data source (Stage 4)

| Symptom | Cause | Fix (plain-language to user) |
|---------|-------|------|
| "file not found" | File not in `data/` or wrong name | "I can't find the file — please put it in the `data` folder and tell me the exact name." |
| Column missing | Header renamed / typo | "I expected a column called X but the file has Y — should I use Y?" |
| DB `ECONNREFUSED` | Wrong host/port, or DB not reachable | Check `.env` host/port; confirm the user is on the right network/VPN. Never print `.env`. |
| DB `password authentication failed` | Wrong credentials in `.env` | "The database login was rejected — please re-check the username/password in the `.env` file (or ask IT)." |
| DB timeout | Firewall / VPN | "I can't reach the database — you may need to be on the company network/VPN." |

## Run (Stage 6.3)

| Symptom | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE` | Port already used | Change `PORT` in `.env` (e.g. 3201) and restart. |
| Page loads but "No data" | metrics returned empty | Check the column map and that `data/` has rows; print first rows to confirm. |
| One metric wrong, others fine | Agg or column map error for that metric | Fix that entry in `datasource.json` / `metrics.js`, re-run. |
| Numbers slightly off vs. source | Bad cells skipped, or wrong agg (sum vs avg) | Confirm the aggregation choice with the user; report any skipped rows. |

## General stance
- Fix the root cause; don't retry blindly.
- After any fix, re-run that stage's VERIFY step before reporting success.
- If the fix needs a secret changed, direct the user to edit `.env` themselves — never handle the secret in chat.

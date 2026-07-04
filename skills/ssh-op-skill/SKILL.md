---
name: ssh-op-skill
description: Manage a Windows-first SSH operations workspace with saved host favorites, one persistent logical current connection, cached remote facts, safe remote execution, mandatory change logs, local reusable operation skills, and private runtime credentials. Use when Codex needs to create or select SSH connections, inspect or operate remote hosts, manage SSH favorites, reuse prior server knowledge, or perform and document remote system changes.
---

# SSH Ops

Treat the repository's ignored `runtime/` directory as the user's private SSH workspace. Keep reusable behavior in this skill and keep hosts, credentials, cached facts, local policies, logs, and learned skills in Runtime.

## Start every response with connection status

Resolve Runtime from `SSH_OPS_RUNTIME` when set; otherwise use the `runtime/` directory directly inside this skill folder. Read `runtime.json` before responding.

Always place exactly one connection banner at the first line of every response while this skill is active:

```text
[SSH Ops | disconnected] Create a connection or select one from favorites.
[SSH Ops | production-web | deploy@203.0.113.10:22 | verified 2026-07-04 14:32 +08:00]
[SSH Ops | temporary | admin@198.51.100.20:22 | selected, not verified]
[SSH Ops | production-web | selected, not verified]
[SSH Ops | production-web | last verification failed]
```

Never display passwords, private-key contents, passphrases, secret references, or credential paths in the banner.

If no current connection exists, continue to help with local planning and favorite management, but do not execute a remote command. Prompt the user to create a connection or select a favorite in every response.

## Use one logical current connection

Interpret "connection" as the active favorite stored in `runtime.json`, not as a guaranteed persistent TCP session. Reuse an OpenSSH connection only when the Windows environment supports it; never claim a live connection solely because a favorite is selected.

To create a temporary connection:

1. Collect host, port (default `22`), user, and authentication method.
2. Store the endpoint inline as a `temporary` current connection in `runtime.json` without writing `inventory/hosts/`.
3. Store only an authentication reference; never store secret material inline.
4. Test SSH access and collect baseline facts when useful.

Do not require an alias or group for a temporary connection. When the user asks to save it as a favorite, require both a new alias and at least one group/category, write the host JSON under `inventory/hosts/`, then convert the current connection to `favorite`. Never silently save a temporary connection.

To select a connection, load the favorite, test access, update `current_connection`, and refresh facts that are missing or stale.

Read [connection-model.md](references/connection-model.md) before implementing connection lifecycle or status changes. Read [windows-auth.md](references/windows-auth.md) before handling keys or passwords.

## Operate safely

Before remote work:

1. Read the host profile, cached facts, local policy, relevant prior logs, and matching local skills.
2. Verify the target shown in the connection banner.
3. Refresh only facts whose freshness matters to the requested work.
4. Back up remote configuration before editing it.
5. Validate a configuration before reloading or restarting a service.

Require explicit user confirmation before destructive, difficult-to-reverse, or access-threatening actions. Never put a secret directly in a command, transcript, log, host profile, or fact cache. Follow [safety-policy.md](references/safety-policy.md).

## Cache remote facts

Store observed machine information in `facts/<alias>.json`. Record the observation time and source for every fact set. Reuse stable facts such as operating-system identity; refresh volatile facts such as service state, addresses, routes, disk usage, and connectivity when relevant. Follow [runtime-schema.md](references/runtime-schema.md).

## Record completed changes immediately

After every concrete remote change, verify the result and immediately create or update a record under `logs/YYYY/YYYY-MM-DD-task-name/record.md`. Include the target, goal, before state, sanitized change summary, verification, rollback, problems, and reusable learnings. Do not require a work record for read-only inspection unless the user asks for one. Follow [logging-policy.md](references/logging-policy.md).

## Reuse local skills

Before recurring work, inspect `skills/index.json` and load a matching `runtime/skills/<name>/SKILL.md`. Keep host-specific outcomes in logs and facts; keep reusable procedures in the local skill. Improve the local skill after verified work reveals a durable lesson. Never copy credentials or private infrastructure identifiers into a reusable procedure.

Treat Runtime skills as private modules loaded by this parent skill. They are not automatically discoverable platform skills unless separately installed.

## Use the bundled scripts

- Run `scripts/init-runtime.ps1` to create a missing Runtime.
- Run `scripts/new-favorite.ps1` to create or update a favorite without embedding a secret.
- Run `scripts/new-temporary-connection.ps1` to select an unsaved endpoint.
- Run `scripts/save-temporary-as-favorite.ps1` only after collecting an alias and at least one group.
- Run `scripts/disconnect.ps1` to clear the current logical connection.
- Run `scripts/show-connection.ps1` to render the required banner.
- Run `scripts/set-current-connection.ps1` after selection or verification.
- Run `scripts/collect-host-facts.ps1` after a verified key or agent connection.
- Run `scripts/save-credential.ps1` to store a Windows DPAPI credential.
- Run `scripts/protect-private-key.ps1` after placing a private key in Runtime.
- Run `scripts/validate-runtime.ps1` after structural changes.

Windows is the only implemented platform. Keep platform-neutral schemas and backend names so a future macOS adapter can use OpenSSH and Keychain without changing favorites, facts, logs, or local skills.

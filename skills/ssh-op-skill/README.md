# ssh-op-skill

`ssh-op-skill` turns an AI coding agent into a small, persistent SSH operations workspace.

Instead of treating every SSH request as a fresh session, it remembers your server favorites, the current target, previously collected system facts, completed work, and reusable operational knowledge. The result feels closer to an SSH bookmark manager combined with an operations notebook.

The skill is currently Windows-first. Its data model leaves room for future macOS support.

## What it does

- Organizes SSH hosts with aliases and categories.
- Supports saved favorites and unsaved temporary connections.
- Keeps one explicit current connection and shows it in every SSH-related response.
- Caches stable host facts so they do not need to be collected repeatedly.
- Applies safety rules before remote changes.
- Records verified changes, rollback information, and troubleshooting notes.
- Turns repeated work into private Runtime skills that improve over time.
- Keeps credentials, host data, logs, and learned knowledge in a private local Runtime.

## Connection model

The current connection is a persistent logical target, not a promise that one TCP session stays open forever. Every status includes its latest verification state and time instead of pretending the host is continuously online.

A new target can remain temporary. If you later save it as a favorite, the skill asks for a name and at least one category.

## Runtime memory

The private Runtime stores:

- SSH favorites and categories
- the current connection
- cached operating-system and host facts
- encrypted credentials or protected key references
- local operating policies
- change logs and rollback notes
- reusable skills learned from completed work

Runtime data is local, ignored by Git, and must never be published with the open-source skill.

## Install

Give the following prompt to your coding agent:

> Install `ssh-op-skill` from https://github.com/zhlicen/vibespace-skills/tree/master/skills/ssh-op-skill for your current agent environment. Use the appropriate user-level Agent Skills directory, keep `runtime/` private and untracked, preserve existing Runtime data if present, and verify that the skill is discoverable after installation.

## Example prompts

```text
$ssh-op-skill list my SSH favorites
```

```text
$ssh-op-skill connect temporarily to test@example.com and do not save it
```

```text
$ssh-op-skill save the current temporary connection as staging-web in the staging category
```

```text
$ssh-op-skill connect to production-web and check Nginx
```

```text
$ssh-op-skill install OpenVPN, verify the result, record the work, and preserve reusable lessons
```

## Safety

The skill does not print credentials or place them in work logs. It backs up configuration before editing, validates changes before service reloads, records rollback information, and requests confirmation for destructive or access-threatening operations.

See [`SKILL.md`](SKILL.md) for the agent workflow and [`references/`](references/) for detailed policies.

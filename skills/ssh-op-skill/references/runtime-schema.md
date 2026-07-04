# Runtime schema

Use JSON so Windows PowerShell can read and update Runtime without an additional YAML dependency.

## Layout

```text
runtime/
  runtime.json
  inventory/hosts/<alias>.json
  inventory/groups.json
  facts/<alias>.json
  secrets/credentials/*.clixml
  secrets/keys/*
  policies/local-policy.md
  logs/YYYY/YYYY-MM-DD-task-name/record.md
  skills/index.json
  skills/<name>/SKILL.md
  cache/
  locks/
```

`runtime.json` contains `schema_version`, `platform`, backend names, and either a `current_connection` object or `null`. A favorite current connection contains `kind: favorite` and `host_ref`. A temporary current connection contains `kind: temporary` and an inline non-secret `endpoint` with host, port, user, and an authentication reference.

A host profile contains `alias`, `host`, `port`, `user`, `groups`, and an `auth` object. Store `auth.type` plus a reference such as `runtime-key:name`, `ssh-agent`, or `dpapi:name`; never store secret material.

A fact file contains `host_ref`, `collected_at`, `source`, and `data`. Do not silently treat an old observation as current state.

Keep aliases lowercase and filesystem-safe. Use tags or groups instead of placing hosts in mutually exclusive category directories.

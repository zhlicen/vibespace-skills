# Safety policy

Apply these rules to every remote operation:

1. Confirm the target alias, host, and user before changing state.
2. Inspect relevant prior records and cached facts.
3. Back up a configuration before modifying it.
4. Validate configuration syntax before reload or restart.
5. Verify the resulting service, route, file, or process state.
6. Preserve a rollback path.
7. Ask before deletion, force flags, process termination, package removal, credential changes, firewall or routing changes, and actions that could break SSH access.

Never expose passwords, passphrases, private keys, tokens, or decrypted credentials in commands, logs, assistant output, shell history, or error transcripts. Redact accidental secret output before recording it.

Prefer SSH keys loaded into `ssh-agent`. Keep password authentication as a compatibility path. Never disable host-key checking merely for convenience; handle a changed host key as a security event.

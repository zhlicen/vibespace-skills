# Windows authentication

Use Windows OpenSSH as the default SSH backend.

## Keys

Allow private keys under `runtime/secrets/keys/` for convenience. Prefer passphrase-protected keys, restrict their ACL to the current Windows identity, and load them into the Windows `ssh-agent` service. A host profile stores only `runtime-key:<name>` or `ssh-agent`.

Also support an external key path when the user already manages keys under `%USERPROFILE%\.ssh`; store the path reference without copying the key.

## Passwords

Store password credentials with Windows DPAPI using `Export-Clixml`. The resulting file is decryptable only by the same Windows user on the same machine. A host profile stores only `dpapi:<name>`.

Do not use DPAPI CLIXML as the future macOS format. Reserve `credential_backend` in `runtime.json`; a macOS implementation should use Keychain.

Do not put decrypted passwords into SSH command arguments. If password automation requires a temporary askpass helper, create it with restrictive permissions, avoid shell history, and remove it immediately.

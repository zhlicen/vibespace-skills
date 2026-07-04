# Logging policy

Create a record immediately after a verified remote change. Use `logs/YYYY/YYYY-MM-DD-task-name/record.md` and keep related sanitized artifacts beside it.

Include:

- actual operation date and target alias;
- user goal and relevant before state;
- sanitized actions and files changed;
- verification evidence;
- rollback instructions;
- troubleshooting and final resolution;
- reusable lessons and whether a local skill was created or updated.

Do not include passwords, tokens, passphrases, private keys, decrypted credentials, or commands containing them. Refer to credential identifiers only at the broadest useful level, for example "password authentication".

Read-only checks do not require a record unless they produce an artifact the user wants retained.

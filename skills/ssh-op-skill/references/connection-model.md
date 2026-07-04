# Connection model

Maintain exactly one logical current connection in Runtime. Its `kind` is either `favorite` or `temporary`.

Use these states:

- `selected`: a favorite is active but has not been verified.
- `verified`: the most recent explicit SSH test succeeded.
- `failed`: the most recent explicit SSH test failed.
- `null`: no favorite is active.

Always store `selected_at`. Store `last_verified_at` only after a successful SSH operation. A prior verification is evidence with a timestamp, not proof of a continuously open network session.

Do not execute remote commands while current connection is `null`. A failed connection may remain selected so the user can repair it, but show failure in every banner.

A temporary connection stores its non-secret endpoint inline in `runtime.json` and does not create a host profile. Do not ask for an alias or group until the user asks to save it. Promotion to a favorite requires a filesystem-safe alias and at least one group/category; copy the endpoint and authentication reference into a new host profile, then replace the current connection with a favorite reference.

Disconnecting clears either kind. Never promote a temporary connection implicitly.

Connection reuse such as OpenSSH multiplexing is an optional backend optimization. It must not alter the logical state model.

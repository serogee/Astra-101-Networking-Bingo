# Commit scopes

Use Conventional Commit-style headers in this project:

`type(scope): summary`

Use one of these scopes:

| Scope | Use for |
| --- | --- |
| `app` | App shell, routing, and shared application wiring |
| `board` | Board layout, tiles, claims, shuffle, and bingo detection |
| `profile` | Player setup, profile validation, and QR identity data |
| `qr` | QR display, encoding, scanning, and scan validation |
| `storage` | Local persistence, hydration, reroll, reset, and migrations |
| `pwa` | Manifest, service worker, caching, install, and offline behavior |
| `ui` | Shared components, visual styling, dialogs, and interactions |
| `a11y` | Accessibility, keyboard support, screen-reader support, and motion preferences |
| `tests` | Automated or manual verification coverage |
| `docs` | Plans, documentation, and developer guidance |
| `deps` | Dependency or toolchain updates |

If a change does not fit an approved scope, propose a new scope and wait for
approval before using it in a commit message.

## Commit-message body

When a body is needed, write it in simple ASD-STE100-style English:

- Use short, direct sentences and active voice.
- Use one meaning for each term.
- State what changed and why it matters.
- Do not use empty lines in the message.

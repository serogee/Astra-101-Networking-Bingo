# ASTRA-101 Bingo Icebreaker — Delivery Plan

## Outcome

Deliver a mobile-first Vite + React + TypeScript PWA for an in-person bingo
icebreaker. After the first successful load, the complete application works
without a network connection: profile setup, board generation, QR display and
scanning, state persistence, rerolls, and reset.

Each participant creates a profile consisting of a name and 3–5 bingo traits.
Their device renders that profile as a QR code. A participant scans another
participant's QR code, chooses one eligible trait from it, and the matching
hidden square on their own board is revealed with the provider's name. A row,
column, or diagonal triggers a judge-facing Bingo screen.

## Product rules

### Board

- Use the supplied 24 traits exactly once each, shuffled into the 24 non-centre
  positions of a 5×5 grid.
- Put `FREE SPACE` in the centre and mark it as completed from the start.
- Keep every non-free tile face-down until claimed. Its back must not expose the
  trait label or icon.
- A claimed tile shows its Lucide icon, label, and the name of the person whose
  QR supplied that trait.
- Claimed tiles are buttons. Selecting one opens a read-only detail sheet with
  the provider's name and all traits embedded in the QR scan.

### Profile and QR exchange

- Setup requires a trimmed display name and exactly 3–5 distinct traits.
- Give every profile a locally generated UUID. The QR payload contains a
  version, UUID, display name, and trait IDs; use a compact base64url-encoded
  JSON payload rather than delimiter-separated labels so names cannot corrupt
  parsing.
- Validate the QR payload before use: correct version/schema, known unique trait
  IDs, 3–5 traits, non-empty bounded display name, and not the current user's
  own profile ID.
- Record the scanned profile's UUID after a successful claim. Do not use names
  as identity because names may repeat.
- The picker displays every scanned trait. Only traits represented by an
  unclaimed board square are enabled. A successful choice claims one matching
  square and stores an immutable scan snapshot on that tile.
- If all possible squares are already claimed, show a clear no-eligible-traits
  result and do not add the person to scan history.
- If the same QR is scanned again, explain that the person was already used and
  offer no second claim.

### Game completion and recovery

- After every claim, check the five rows, five columns, and two diagonals.
- On the first completed line, persist the winning line and open a full-screen
  “Show this to a judge” view containing the player name, highlighted winning
  line, and the contributors for its non-free squares.
- `Reroll board` asks for confirmation, makes a new shuffle, clears claims,
  winning state, and scan history, but keeps the player's profile. Clearing scan
  history is necessary for the new board to remain playable.
- `Clear all data` asks for confirmation, removes all application-owned local
  storage records, and returns to setup. It must not call broad
  `localStorage.clear()` because that can erase unrelated sites/apps using the
  same origin.

## Technology and architecture

| Concern | Choice |
|---|---|
| App | Vite, React, TypeScript |
| Icons | `lucide-react` only |
| QR render | `qrcode.react` |
| QR camera | `html5-qrcode` (loaded only while scanner is open) |
| PWA | `vite-plugin-pwa` with Workbox `generateSW` |
| State | React reducer/context with a versioned localStorage document |
| Styling | Responsive CSS with reduced-motion support |

Keep a single versioned persistence object (`astra-bingo:v1`) rather than
uncoordinated storage keys. Its board tiles store the trait ID and, when
claimed, a `ProviderSnapshot` (`profileId`, `name`, `traitIds`). Store the
winning line as board indexes. Validate and discard/migrate malformed saved data
at app startup.

Use trait IDs as program data and labels/icons only as presentation data. This
prevents QR compatibility from breaking when text is edited. The centre free
tile has no provider snapshot.

## Screens and interactions

1. **Setup** — name input, accessible selectable trait grid, selected-count
   status, validation feedback, and Start button.
2. **Board** — header with My QR and settings; labelled 5×5 grid; Scan action;
   claimed tile detail dialog; and clear empty/error states.
3. **My QR dialog** — high-contrast QR, name, brief handoff instruction, close
   control. Provide enough quiet zone and sizing for phones to scan it.
4. **Scanner dialog** — permission explanation, camera view, cancel/retry
   controls, and manual pasted-payload fallback for devices without a usable
   camera. Stop and release the camera immediately after a valid scan or close.
5. **Trait picker dialog** — scanned name, enabled/disabled traits with reasons,
   single claim action, and cancellation that changes no game state.
6. **Bingo judge view** — winning line proof, contributor list, and an explicit
   “Back to board” control after the prompt has been seen; gameplay is locked
   after the first win unless rerolled/reset.
7. **Settings dialog** — separate confirmed actions for reroll and full reset.

## Offline PWA requirements

- Add a manifest (`name`, `short_name`, theme/background colours, standalone
  display, 192px and 512px icons) and register the generated service worker.
- Precache the app shell, JavaScript, CSS, bundled fonts, icons, and local image
  assets. Do not rely on a runtime Google Font request; use a system stack or
  bundle a font.
- The app has no required API calls. Profile and game data stay on-device.
- Show a non-disruptive update-ready prompt when a new service worker is waiting.
- Verify production build and a second offline launch after the first online
  load. Note in deployment instructions that camera scanning requires HTTPS (or
  localhost) and camera permission.

## Implementation order

1. Scaffold Vite React TypeScript; add dependencies, PWA config, manifest assets,
   base mobile styles, and production build check.
2. Define the 24 `BingoItem` records (IDs, exact labels, Lucide icon components)
   plus the fixed free-space tile. Implement Fisher–Yates shuffle and line
   detection as pure functions.
3. Implement QR codec/schema validation and the versioned persistence reducer:
   profile creation, board creation, claim, reroll, reset, hydration, and
   corruption recovery.
4. Build setup and board UIs, including hidden/revealed states and accessible
   keyboard/dialog behavior.
5. Build My QR, camera scanner, parsing/error states, trait picker, and tile
   detail dialog. Ensure camera cleanup and duplicate/self-scan protections.
6. Add completion lockout and judge proof screen, then settings confirmation
   flows.
7. Finish responsive visual design, Lucide-only icon usage, touch targets,
   `prefers-reduced-motion`, PWA update UX, and offline testing.

## Verification and acceptance tests

- Unit-test shuffle invariants, QR valid/invalid cases, board claims, reroll,
  reset, and all 12 Bingo lines.
- Test setup boundaries: blank name, 2/3/5/6 traits, duplicate traits, and
  whitespace-only names.
- Test self QR, malformed/unsupported QR, a duplicate person, no eligible trait,
  a successful single claim, tile-detail data, completion with the free square,
  and first-win lockout.
- Manually test Android/iOS-sized layouts, keyboard-only navigation, screen-reader
  labels, denied camera permission, manual code entry, and QR scan on two phones.
- Run a production build, install/open the PWA, reload with DevTools offline, and
  confirm the game persists across refresh and works after installation.

## Trait catalogue

Use these labels verbatim, with a fitting Lucide icon selected in the item data:

1. Has a side project
2. From another course
3. From another year
4. Tried an AI image tool
5. Night owl
6. Has a pet
7. Has GitHub
8. Has used ChatGPT
9. Uses AI to study
10. Has a creative hobby
11. Has tried vibecoding
12. Follows ASTRA Developers
13. Has joined a hackathon
14. Uses AI for research
15. Loves to cram
16. Has an idea to build
17. Loves coffee
18. Has attended an AI event
19. Came here knowing nobody
20. Has debugged with AI
21. Is an only child
22. Has LinkedIn
23. Has a business idea
24. Has a favorite AI tool

## Confirmed event rules

1. **One claim per person:** A scanned participant may complete exactly one
   square, using one of the traits they selected when setting up their profile.
   Their QR cannot be used for another claim on the same board.
2. **Reroll clears scan history:** Reroll resets the board's claims and win
   state, and makes all previously scanned participants eligible again. It keeps
   the player's profile.
3. **Judge verification:** The judge view is visual proof only. There is no
   judge login, server record, or anti-cheat validation.
4. **Post-win board:** After the first straight bingo, the board is read-only.
   The player can show the judge view, inspect claimed-tile details, reroll, or
   perform a full reset, but cannot make further claims.
5. **Profile changes:** There is no Edit Profile action. Changing a name or
   selected traits requires Clear all data / full reset, which removes the
   profile and board before setup begins again.


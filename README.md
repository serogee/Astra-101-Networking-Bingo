# ASTRA-101 Networking Bingo

A mobile-friendly, offline-capable networking icebreaker for ASTRA 101 events. Players build a profile, receive a personal QR code, meet other attendees, and scan each other to reveal and claim matching bingo squares.

> [!WARNING]
> TODO:
>
> - Add Year and College input (for cards like "From another year/college")
> - Fix mobile styling (currently dont fit inside the cards)

## How it works

1. **Create a profile.** Enter a display name and select 3–5 traits from the 24-item catalogue.
2. **Receive a board and QR code.** The app gives the player a freshly shuffled 5×5 board with a free centre square, and creates a QR code containing their profile.
3. **Meet and scan.** A player finds someone who matches a hidden square, scans that person's QR code (or pastes its text manually), then chooses one of that person's traits that appears on their board.
4. **Claim the square.** The selected square is revealed and stores the scanned player's name. The same person cannot be used twice, and a player cannot scan their own code.
5. **Win.** Five claimed squares in a horizontal, vertical, or diagonal line (with the free centre square counting automatically) triggers the bingo celebration. The player can then show the completed card to the facilitator.

Claimed squares can be tapped to see the participant and trait that provided the claim. In Settings, **Reroll Board** reshuffles the board and clears claims while retaining the profile; **Clear All Data** removes the profile and game entirely.

## Features

- 24 networking traits, randomly arranged on each new 5×5 board
- Required profile name and 3–5 selected traits
- Personal, shareable QR profiles
- Camera-based scanning with manual QR-text entry as a fallback
- QR validation, including payload version, required values, allowed trait IDs, and duplicate traits
- Protection against self-scans and reusing the same participant
- Automatic 5-in-a-row detection across 12 winning lines
- Persistent local game state, including profile, board order, claimed squares, and scan history
- Installable Progressive Web App (PWA) with precached build assets for offline reuse
- Responsive, touch-friendly UI and accessible labels for the board and controls

## QR format

The QR code is generated in the browser with `qrcode.react` as a 200px SVG, medium error correction (`M`), dark foreground (`#0A0E1A`), and a white background.

Its encoded text uses this format:

```text
BINGO:<base64url-encoded JSON>
```

For example, before encoding:

```json
{
    "v": 1,
    "id": "a-UUID-created-in-the-browser",
    "name": "Ada",
    "traits": ["github", "coffee", "hackathon"]
}
```

The JSON is UTF-8 encoded and converted to unpadded Base64URL (`+` becomes `-`, `/` becomes `_`, and trailing `=` padding is removed), then prefixed with `BINGO:`. A unique profile ID is created with the browser's `crypto.randomUUID()` API when the profile is created.

### QR payload keys

| Key      | Meaning                   | Validation                                                         |
| -------- | ------------------------- | ------------------------------------------------------------------ |
| `v`      | QR schema version         | Must be numeric version `1`                                        |
| `id`     | Unique profile identifier | Must be a non-empty string                                         |
| `name`   | Player display name       | Must be a non-empty string, at most 100 characters in a QR payload |
| `traits` | Selected trait IDs        | Must contain 3–5 unique IDs from the supported trait catalogue     |

QR data is not encrypted or signed. It is suitable for an event icebreaker, not for identity verification or sensitive data. The scanner rejects malformed payloads, unknown traits, unsupported versions, self-scans, and previously scanned profile IDs.

## Local storage and keys

The app has no backend, database, API tokens, or required `.env` file. Each browser stores its own state under this localStorage key:

| Key              | Contents                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `astra-bingo:v1` | Versioned profile, board shuffle order, claimed tiles, winning state, and previously scanned profile IDs |

Clearing browser site data or using **Clear All Data** removes this entry. Because state is local to a browser, it is not synchronized between devices.

## Technology

- **React 19** and **TypeScript** for the user interface and type-safe application state
- **Vite 8** for local development and production builds
- **Vite PWA plugin / Workbox** for the web app manifest, service worker generation, and precaching JS, CSS, HTML, SVG, PNG, and font build assets
- **`qrcode.react`** to render SVG QR codes
- **`html5-qrcode`** to scan through the device camera; manual text entry remains available when camera access is unavailable
- **Browser Web APIs:** `localStorage` for persistence, `crypto.randomUUID()` for profile IDs, and `TextEncoder`/`TextDecoder`, `btoa`, and `atob` for the Base64URL QR codec
- **Lucide React** for interface and trait icons
- **ESLint** for linting

The PWA is configured with a `prompt` update strategy: a newly built service worker waits for the application to prompt the user before activation. Build assets are precached, so a previously loaded version can continue to open offline. Camera scanning normally requires a secure context (HTTPS); `localhost` is treated as secure by browsers for local development.

## Local development

### Prerequisites

- Node.js 20 or newer (an active LTS release is recommended)
- npm (included with Node.js)

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/Astra-101-Networking-Bingo/`). The configured production base path is `/Astra-101-Networking-Bingo/`; Vite will include it in the development URL as well.

### Validate and build

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` runs TypeScript project checks and produces the deployable app in `dist/`. `npm run preview` serves that production build locally.

### Testing QR scanning locally

- On the same machine, use the camera scanner at `localhost` and grant camera permission when prompted.
- To test between devices, serve the app over HTTPS and open it from each device. Most mobile browsers restrict camera access to HTTPS pages.
- If a camera is unavailable, open a player's QR modal, copy or otherwise obtain the full `BINGO:...` value, and use **Enter code manually** in the scanner.

## Project map

```text
src/
  data/bingoItems.ts        Trait catalogue and free-space metadata
  context/GameContext.tsx   Game reducer, persistence, and QR payload creation
  utils/qrCodec.ts          QR Base64URL encoding, decoding, and validation
  utils/storage.ts          localStorage schema and board helpers
  hooks/useBingoDetection.ts Winning-line detection
  screens/                  Setup and gameplay screens
  components/               Board, QR, scanner, settings, and dialog UI
vite.config.ts              Vite base path and PWA/Workbox configuration
```

## Deployment note

The app is configured to be served from `/Astra-101-Networking-Bingo/`. If it will be hosted at another path or domain root, update `base` and `manifest.start_url` in `vite.config.ts` before building.

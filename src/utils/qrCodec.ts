import { VALID_TRAIT_IDS } from '../data/bingoItems';

const QR_PREFIX = 'BINGO:';

export interface QRPayload {
  v: number;
  id: string;
  name: string;
  traits: string[];
}

/** Base64url encode a string (no padding). */
function toBase64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Base64url decode a string. */
function fromBase64url(b64: string): string {
  let padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4 !== 0) {
    padded += '=';
  }
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/** Encode a profile into a QR code string. */
export function encodeQR(payload: QRPayload): string {
  return QR_PREFIX + toBase64url(JSON.stringify(payload));
}

/**
 * Decode and validate a QR code string.
 * Returns the payload on success, or a string error message on failure.
 */
export function decodeQR(raw: string): QRPayload | string {
  if (!raw.startsWith(QR_PREFIX)) {
    return 'Not a valid ASTRA Bingo QR code.';
  }

  const encoded = raw.slice(QR_PREFIX.length);

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64url(encoded));
  } catch {
    return 'QR code data is corrupted.';
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return 'QR code data is invalid.';
  }

  const obj = parsed as Record<string, unknown>;

  // Version check
  if (obj.v !== 1) {
    return 'Unsupported QR code version.';
  }

  // Profile ID
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return 'QR code is missing a profile ID.';
  }

  // Name
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    return 'QR code is missing a display name.';
  }
  if (obj.name.length > 100) {
    return 'Display name in QR code is too long.';
  }

  // Traits
  if (!Array.isArray(obj.traits)) {
    return 'QR code is missing trait data.';
  }
  if (obj.traits.length < 3 || obj.traits.length > 5) {
    return 'QR code must contain 3–5 traits.';
  }

  // Check for unknown trait IDs
  for (const trait of obj.traits) {
    if (typeof trait !== 'string' || !VALID_TRAIT_IDS.has(trait)) {
      return `QR code contains an unknown trait: "${trait}".`;
    }
  }

  // Check for duplicate trait IDs
  const uniqueTraits = new Set(obj.traits as string[]);
  if (uniqueTraits.size !== obj.traits.length) {
    return 'QR code contains duplicate traits.';
  }

  return {
    v: 1,
    id: obj.id as string,
    name: (obj.name as string).trim(),
    traits: obj.traits as string[],
  };
}

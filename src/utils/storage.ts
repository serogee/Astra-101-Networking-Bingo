import { BINGO_ITEMS, FREE_SPACE_INDEX, VALID_TRAIT_IDS } from '../data/bingoItems';

const STORAGE_KEY = 'astra-bingo:v1';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  traitIds: string[];
}

export interface ProviderSnapshot {
  profileId: string;
  name: string;
  traitIds: string[];
}

export interface ClaimedTile {
  traitId: string;
  provider: ProviderSnapshot | null; // null for FREE SPACE
}

export interface BoardState {
  shuffleOrder: string[]; // 24 trait IDs
  tiles: Record<number, ClaimedTile | null>; // index → claimed or null
  winningLine: number[] | null;
  bingoAchieved: boolean;
}

export interface GameState {
  version: number;
  profile: Profile | null;
  board: BoardState | null;
  scannedProfileIds: string[];
}

// ─── Initial state ──────────────────────────────────────────────────────────

export const INITIAL_STATE: GameState = {
  version: 1,
  profile: null,
  board: null,
  scannedProfileIds: [],
};

// ─── Read / Write ───────────────────────────────────────────────────────────

/** Read persisted state, with corruption recovery. */
export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_STATE };

    const parsed = JSON.parse(raw) as GameState;

    // Basic shape validation
    if (typeof parsed !== 'object' || parsed === null || parsed.version !== 1) {
      console.warn('[storage] Invalid version or shape, resetting.');
      clearState();
      return { ...INITIAL_STATE };
    }

    return parsed;
  } catch (e) {
    console.warn('[storage] Corrupted data, resetting.', e);
    clearState();
    return { ...INITIAL_STATE };
  }
}

/** Persist state to localStorage. */
export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Remove only our app-owned key. */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Board creation ─────────────────────────────────────────────────────────

/** Create a new shuffled board. */
export function createBoard(shuffledTraitIds: string[]): BoardState {
  const tiles: Record<number, ClaimedTile | null> = {};

  for (let i = 0; i < 25; i++) {
    if (i === FREE_SPACE_INDEX) {
      tiles[i] = { traitId: 'free', provider: null };
    } else {
      tiles[i] = null;
    }
  }

  return {
    shuffleOrder: shuffledTraitIds,
    tiles,
    winningLine: null,
    bingoAchieved: false,
  };
}

/**
 * Get the trait ID at a given board index.
 * The shuffleOrder has 24 entries; index 12 (centre) is FREE SPACE.
 */
export function getTraitIdAtIndex(board: BoardState, index: number): string {
  if (index === FREE_SPACE_INDEX) return 'free';
  // Indices 0-11 map to shuffleOrder[0-11], indices 13-24 map to shuffleOrder[12-23]
  const orderIndex = index < FREE_SPACE_INDEX ? index : index - 1;
  return board.shuffleOrder[orderIndex];
}

/**
 * Find the board index for a given trait ID.
 * Returns -1 if not found.
 */
export function findIndexForTraitId(board: BoardState, traitId: string): number {
  if (traitId === 'free') return FREE_SPACE_INDEX;
  const orderIndex = board.shuffleOrder.indexOf(traitId);
  if (orderIndex === -1) return -1;
  return orderIndex < FREE_SPACE_INDEX ? orderIndex : orderIndex + 1;
}

// ─── Validation helpers ─────────────────────────────────────────────────────

/** Check that a shuffleOrder array is valid. */
export function isValidShuffleOrder(order: string[]): boolean {
  if (order.length !== BINGO_ITEMS.length) return false;
  const set = new Set(order);
  if (set.size !== order.length) return false;
  for (const id of order) {
    if (!VALID_TRAIT_IDS.has(id)) return false;
  }
  return true;
}

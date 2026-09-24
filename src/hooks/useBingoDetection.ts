import { FREE_SPACE_INDEX } from '../data/bingoItems';
import type { BoardState } from '../utils/storage';

/** All 12 possible winning lines: 5 rows + 5 cols + 2 diagonals. */
const LINES: number[][] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

/**
 * Check all 12 lines and return the first completed one, or null.
 * A tile is "complete" if it's the free space or has been claimed.
 */
export function detectBingo(board: BoardState): number[] | null {
  for (const line of LINES) {
    const allComplete = line.every((idx) => {
      if (idx === FREE_SPACE_INDEX) return true;
      return board.tiles[idx] != null;
    });
    if (allComplete) return line;
  }
  return null;
}

/**
 * Check if a specific tile index is part of the winning line.
 */
export function isInWinningLine(winningLine: number[] | null, index: number): boolean {
  if (!winningLine) return false;
  return winningLine.includes(index);
}

export { LINES };

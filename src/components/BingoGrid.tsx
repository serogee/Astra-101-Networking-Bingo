import { BingoTile } from './BingoTile';
import type { BoardState } from '../utils/storage';
import './BingoGrid.css';

interface BingoGridProps {
  board: BoardState;
  onTileClick: (index: number) => void;
}

export function BingoGrid({ board, onTileClick }: BingoGridProps) {
  return (
    <div className="bingo-grid" role="grid" aria-label="Bingo board">
      {Array.from({ length: 25 }, (_, i) => (
        <BingoTile key={i} index={i} board={board} onTileClick={onTileClick} />
      ))}
    </div>
  );
}

import { HelpCircle } from 'lucide-react';
import { getItemById, FREE_SPACE_INDEX } from '../data/bingoItems';
import { getTraitIdAtIndex, type BoardState } from '../utils/storage';
import { isInWinningLine } from '../hooks/useBingoDetection';
import './BingoTile.css';

interface BingoTileProps {
  index: number;
  board: BoardState;
  onTileClick: (index: number) => void;
}

export function BingoTile({ index, board, onTileClick }: BingoTileProps) {
  const traitId = getTraitIdAtIndex(board, index);
  const tile = board.tiles[index];
  const isFree = index === FREE_SPACE_INDEX;
  const isClaimed = tile != null;
  const inWinLine = isInWinningLine(board.winningLine, index);
  const item = getItemById(traitId);

  if (!item) return null;

  const Icon = item.icon;

  return (
    <button
      className={`bingo-tile ${isClaimed ? 'claimed' : 'face-down'} ${isFree ? 'free-space' : ''} ${inWinLine ? 'winning' : ''}`}
      onClick={() => isClaimed && onTileClick(index)}
      disabled={!isClaimed}
      aria-label={isClaimed ? `${item.label} - claimed by ${tile?.provider?.name ?? 'FREE'}` : 'Hidden tile'}
    >
      <div className="tile-inner">
        {/* Face-down (back) */}
        <div className="tile-back">
          <HelpCircle size={24} strokeWidth={1.5} />
        </div>

        {/* Face-up (front) */}
        <div className="tile-front">
          <Icon size={22} strokeWidth={1.5} />
          <span className="tile-label">{item.label}</span>
          {!isFree && tile?.provider && (
            <span className="tile-provider">{tile.provider.name}</span>
          )}
        </div>
      </div>
    </button>
  );
}

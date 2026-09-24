import { X, Check } from 'lucide-react';
import { getItemById } from '../data/bingoItems';
import type { QRPayload } from '../utils/qrCodec';
import type { BoardState } from '../utils/storage';
import { findIndexForTraitId } from '../utils/storage';
import './TraitPicker.css';

interface TraitPickerProps {
  open: boolean;
  scannedUser: QRPayload | null;
  board: BoardState;
  onPick: (traitId: string) => void;
  onClose: () => void;
}

export function TraitPicker({ open, scannedUser, board, onPick, onClose }: TraitPickerProps) {
  if (!open || !scannedUser) return null;

  const traits = scannedUser.traits.map((traitId) => {
    const item = getItemById(traitId);
    const boardIndex = findIndexForTraitId(board, traitId);
    const isOnBoard = boardIndex !== -1;
    const isClaimed = isOnBoard && board.tiles[boardIndex] != null;
    const isEligible = isOnBoard && !isClaimed;

    return { traitId, item, isOnBoard, isClaimed, isEligible };
  });

  const hasEligible = traits.some((t) => t.isEligible);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="trait-picker-content" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h3 className="trait-picker-title">
          <span className="trait-picker-name">{scannedUser.name}</span>
          <span className="trait-picker-subtitle">Choose a trait to claim</span>
        </h3>

        {!hasEligible && (
          <p className="trait-picker-no-match">
            No matching tiles available on your board. Try scanning someone else!
          </p>
        )}

        <div className="trait-picker-grid">
          {traits.map(({ traitId, item, isClaimed, isEligible }) => {
            if (!item) return null;
            const Icon = item.icon;

            return (
              <button
                key={traitId}
                className={`trait-card ${isEligible ? 'eligible' : 'disabled'}`}
                onClick={() => isEligible && onPick(traitId)}
                disabled={!isEligible}
                aria-label={`${item.label}${isClaimed ? ' - Already filled' : !isEligible ? ' - Not on your board' : ''}`}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span className="trait-card-label">{item.label}</span>
                {isClaimed && <span className="trait-card-status">Already filled</span>}
                {!isClaimed && !isEligible && <span className="trait-card-status">Not on board</span>}
                {isEligible && (
                  <span className="trait-card-check">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button className="dialog-btn dialog-btn-cancel trait-picker-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { getItemById } from '../data/bingoItems';
import type { ProviderSnapshot } from '../utils/storage';
import './TileDetailModal.css';

interface TileDetailModalProps {
  open: boolean;
  provider: ProviderSnapshot | null;
  traitId: string | null;
  onClose: () => void;
}

export function TileDetailModal({ open, provider, traitId, onClose }: TileDetailModalProps) {
  if (!open || !provider || !traitId) return null;

  const claimedItem = getItemById(traitId);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="tile-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h3 className="tile-detail-name">{provider.name}</h3>
        <p className="tile-detail-claimed-label">
          Provided: <strong>{claimedItem?.label}</strong>
        </p>

        <div className="tile-detail-traits">
          <p className="tile-detail-traits-title">All their traits:</p>
          <ul className="tile-detail-trait-list">
            {provider.traitIds.map((tid) => {
              const item = getItemById(tid);
              if (!item) return null;
              const Icon = item.icon;
              return (
                <li key={tid} className={`tile-detail-trait-item ${tid === traitId ? 'highlighted' : ''}`}>
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

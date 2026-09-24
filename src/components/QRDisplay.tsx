import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getItemById } from '../data/bingoItems';
import './QRDisplay.css';

interface QRDisplayProps {
  open: boolean;
  qrString: string;
  playerName: string;
  traitIds: string[];
  onClose: () => void;
}

export function QRDisplay({ open, qrString, playerName, traitIds, onClose }: QRDisplayProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="qr-display-content" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <h3 className="qr-display-title">My QR Code</h3>

        <div className="qr-display-code">
          <QRCodeSVG
            value={qrString}
            size={200}
            bgColor="#ffffff"
            fgColor="#0A0E1A"
            level="M"
            includeMargin
          />
        </div>

        <p className="qr-display-name">{playerName}</p>
        <p className="qr-display-hint">Show this to other players to scan</p>

        <div className="qr-display-traits">
          <p className="qr-display-traits-title">My traits</p>
          <ul className="qr-display-trait-list">
            {traitIds.map((tid) => {
              const item = getItemById(tid);
              if (!item) return null;
              const Icon = item.icon;
              return (
                <li key={tid} className="qr-display-trait-item">
                  <Icon size={15} strokeWidth={1.5} />
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

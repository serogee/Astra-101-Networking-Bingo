import { QrCode, Settings } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onShowQR: () => void;
  onOpenSettings: () => void;
  showActions?: boolean;
}

export function Header({ onShowQR, onOpenSettings, showActions = true }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo">ASTRA</span>
        <span className="header-logo-sub">101</span>
      </div>
      {showActions && (
        <div className="header-actions">
          <button className="header-btn" onClick={onShowQR} aria-label="Show my QR code">
            <QrCode size={20} />
            <span>My QR</span>
          </button>
          <button className="header-btn header-btn-icon" onClick={onOpenSettings} aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      )}
    </header>
  );
}

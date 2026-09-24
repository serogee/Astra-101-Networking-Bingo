import { useState } from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import './SettingsMenu.css';

interface SettingsMenuProps {
  open: boolean;
  onReroll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function SettingsMenu({ open, onReroll, onClearAll, onClose }: SettingsMenuProps) {
  const [confirmAction, setConfirmAction] = useState<'reroll' | 'clear' | null>(null);

  if (!open) return null;

  const handleConfirm = () => {
    if (confirmAction === 'reroll') {
      onReroll();
    } else if (confirmAction === 'clear') {
      onClearAll();
    }
    setConfirmAction(null);
    onClose();
  };

  return (
    <>
      <div className="dialog-overlay" onClick={onClose}>
        <div className="settings-content" onClick={(e) => e.stopPropagation()}>
          <div className="settings-header">
            <h3 className="settings-title">Settings</h3>
            <button className="dialog-close" onClick={onClose} aria-label="Close settings">
              <X size={18} />
            </button>
          </div>

          <button className="settings-option" onClick={() => setConfirmAction('reroll')}>
            <RotateCcw size={18} />
            <div className="settings-option-text">
              <span className="settings-option-label">Reroll Board</span>
              <span className="settings-option-desc">
                New shuffle, keep your profile
              </span>
            </div>
          </button>

          <button className="settings-option settings-option-danger" onClick={() => setConfirmAction('clear')}>
            <Trash2 size={18} />
            <div className="settings-option-text">
              <span className="settings-option-label">Clear All Data</span>
              <span className="settings-option-desc">
                Delete profile and board, start over
              </span>
            </div>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === 'reroll'}
        title="Reroll Board?"
        message="This will reshuffle your board and clear all claimed tiles and scan history. Your profile (name and traits) will be kept."
        confirmLabel="Reroll"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === 'clear'}
        title="Clear All Data?"
        message="This will permanently delete your profile and board. You'll need to set up again from scratch."
        confirmLabel="Delete Everything"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        destructive
      />
    </>
  );
}

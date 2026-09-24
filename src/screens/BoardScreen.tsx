import { useState, useCallback } from 'react';
import { Scan, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getTraitIdAtIndex, type ProviderSnapshot } from '../utils/storage';
import type { QRPayload } from '../utils/qrCodec';
import { Header } from '../components/Header';
import { BingoGrid } from '../components/BingoGrid';
import { QRDisplay } from '../components/QRDisplay';
import { QRScanner } from '../components/QRScanner';
import { TraitPicker } from '../components/TraitPicker';
import { TileDetailModal } from '../components/TileDetailModal';
import { BingoCelebration } from '../components/BingoCelebration';
import { SettingsMenu } from '../components/SettingsMenu';
import './BoardScreen.css';

type Modal = 'none' | 'qr' | 'scanner' | 'settings' | 'celebration';

export function BoardScreen() {
  const { state, dispatch, qrString } = useGame();
  const [activeModal, setActiveModal] = useState<Modal>('none');
  const [scannedUser, setScannedUser] = useState<QRPayload | null>(null);
  const [showTraitPicker, setShowTraitPicker] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{ traitId: string; provider: ProviderSnapshot } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const board = state.board!;
  const profile = state.profile!;
  const isBingo = board.bingoAchieved;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Show celebration on bingo
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const showCelebration = isBingo && !celebrationDismissed;

  // Handle scan result
  const handleScanResult = useCallback((payload: QRPayload) => {
    setScannedUser(payload);
    setActiveModal('none');
    setShowTraitPicker(true);
  }, []);

  const handleDuplicate = useCallback((name: string) => {
    setActiveModal('none');
    showToast(`You've already scanned ${name}!`);
  }, [showToast]);

  const handleScanError = useCallback((message: string) => {
    setActiveModal('none');
    showToast(message);
  }, [showToast]);

  // Handle trait pick
  const handleTraitPick = useCallback((traitId: string) => {
    if (!scannedUser) return;

    const provider: ProviderSnapshot = {
      profileId: scannedUser.id,
      name: scannedUser.name,
      traitIds: scannedUser.traits,
    };

    dispatch({ type: 'CLAIM_TILE', traitId, provider });
    setShowTraitPicker(false);
    setScannedUser(null);
  }, [scannedUser, dispatch]);

  // Handle trait picker close — don't add to scan history if no pick was made
  const handleTraitPickerClose = useCallback(() => {
    setShowTraitPicker(false);
    setScannedUser(null);
  }, []);

  // Handle tile click (show detail)
  const handleTileClick = useCallback((index: number) => {
    const tile = board.tiles[index];
    if (!tile || !tile.provider) return;

    setSelectedTile({
      traitId: getTraitIdAtIndex(board, index),
      provider: tile.provider,
    });
  }, [board]);

  // Settings actions
  const handleReroll = useCallback(() => {
    dispatch({ type: 'REROLL_BOARD' });
    setCelebrationDismissed(false);
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  // Count claimed tiles (excluding free space)
  const claimedCount = Object.values(board.tiles).filter(
    (t) => t != null && t.traitId !== 'free'
  ).length;

  return (
    <div className="board-screen">
      <Header
        onShowQR={() => setActiveModal('qr')}
        onOpenSettings={() => setActiveModal('settings')}
      />

      <div className="board-hero">
        <h1 className="board-title">NETWORKING BINGO</h1>
        <p className="board-subtitle">Meet. Connect. Build.</p>
      </div>

      <div className="board-badge">
        <Users size={14} />
        <span>Complete 5 in a row!</span>
      </div>

      <BingoGrid board={board} onTileClick={handleTileClick} />

      <div className="board-progress">
        {claimedCount}/24 tiles claimed
      </div>

      {/* How to play */}
      <div className="board-howto">
        <h3 className="board-howto-title">HOW TO PLAY</h3>
        <div className="board-howto-grid">
          <div className="board-howto-item"><span className="board-howto-num">1</span> Find someone matching a square.</div>
          <div className="board-howto-item"><span className="board-howto-num">2</span> Scan their QR code.</div>
          <div className="board-howto-item"><span className="board-howto-num">3</span> One person can only be used once.</div>
          <div className="board-howto-item"><span className="board-howto-num">4</span> Don't use yourself.</div>
          <div className="board-howto-item"><span className="board-howto-num">5</span> Complete 5 in a row (horizontal, vertical, or diagonal).</div>
          <div className="board-howto-item"><span className="board-howto-num">6</span> Show your card to the facilitator.</div>
        </div>
      </div>

      <footer className="board-footer">
        ASTRA 101 | Networking Bingo
      </footer>

      {/* FAB — Scan button */}
      {!isBingo && (
        <button
          className="board-fab"
          onClick={() => setActiveModal('scanner')}
          aria-label="Scan QR code"
        >
          <Scan size={22} />
          <span>Scan</span>
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="board-toast">{toast}</div>
      )}

      {/* Modals */}
      <QRDisplay
        open={activeModal === 'qr'}
        qrString={qrString ?? ''}
        playerName={profile.name}
        traitIds={profile.traitIds}
        onClose={() => setActiveModal('none')}
      />

      <QRScanner
        open={activeModal === 'scanner'}
        currentProfileId={profile.id}
        scannedProfileIds={state.scannedProfileIds}
        onScanResult={handleScanResult}
        onDuplicate={handleDuplicate}
        onError={handleScanError}
        onClose={() => setActiveModal('none')}
      />

      <TraitPicker
        open={showTraitPicker}
        scannedUser={scannedUser}
        board={board}
        onPick={handleTraitPick}
        onClose={handleTraitPickerClose}
      />

      <TileDetailModal
        open={selectedTile !== null}
        provider={selectedTile?.provider ?? null}
        traitId={selectedTile?.traitId ?? null}
        onClose={() => setSelectedTile(null)}
      />

      <SettingsMenu
        open={activeModal === 'settings'}
        onReroll={handleReroll}
        onClearAll={handleClearAll}
        onClose={() => setActiveModal('none')}
      />

      <BingoCelebration
        open={showCelebration}
        playerName={profile.name}
        board={board}
        onBack={() => setCelebrationDismissed(true)}
      />
    </div>
  );
}

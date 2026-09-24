import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { decodeQR, type QRPayload } from '../utils/qrCodec';
import './QRScanner.css';

interface QRScannerProps {
  open: boolean;
  currentProfileId: string;
  scannedProfileIds: string[];
  onScanResult: (payload: QRPayload) => void;
  onDuplicate: (name: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export function QRScanner({
  open,
  currentProfileId,
  scannedProfileIds,
  onScanResult,
  onDuplicate,
  onError,
  onClose,
}: QRScannerProps) {
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  const cleanup = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch {
        // Ignore cleanup errors
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Ignore
      }
      scannerRef.current = null;
    }
  }, []);

  const processPayload = useCallback((raw: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    const result = decodeQR(raw);
    if (typeof result === 'string') {
      onError(result);
      processingRef.current = false;
      return;
    }

    if (result.id === currentProfileId) {
      onError("You can't scan your own QR code!");
      processingRef.current = false;
      return;
    }

    if (scannedProfileIds.includes(result.id)) {
      onDuplicate(result.name);
      processingRef.current = false;
      return;
    }

    onScanResult(result);
  }, [currentProfileId, scannedProfileIds, onScanResult, onDuplicate, onError]);

  useEffect(() => {
    if (!open || showManual) return;

    let mounted = true;

    const startScanner = async () => {
      await cleanup();

      if (!mounted) return;

      const scannerId = 'qr-scanner-region';
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText) => {
            cleanup().then(() => {
              if (mounted) processPayload(decodedText);
            });
          },
          () => {
            // Ignore scan failures (no QR in frame)
          },
        );
      } catch (err) {
        if (mounted) {
          setCameraError(
            'Camera access denied or unavailable. Use manual entry below.',
          );
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startScanner, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      cleanup();
    };
  }, [open, showManual, cleanup, processPayload]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setShowManual(false);
      setManualInput('');
      setCameraError(null);
      processingRef.current = false;
    }
  }, [open]);

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) return;
    processPayload(trimmed);
    setManualInput('');
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="scanner-content" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={handleClose} aria-label="Close">
          <X size={18} />
        </button>

        <h3 className="scanner-title">Scan QR Code</h3>

        {!showManual ? (
          <>
            <div className="scanner-viewport">
              <div id="qr-scanner-region" ref={containerRef} />
              {cameraError && (
                <div className="scanner-error">
                  <Camera size={24} />
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
            <button
              className="scanner-toggle"
              onClick={() => setShowManual(true)}
            >
              <Keyboard size={16} />
              Enter code manually
            </button>
          </>
        ) : (
          <div className="scanner-manual">
            <p className="scanner-manual-hint">
              Paste the full QR code text from the other player:
            </p>
            <textarea
              className="scanner-manual-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="BINGO:..."
              rows={3}
              autoFocus
            />
            <div className="scanner-manual-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={() => setShowManual(false)}>
                <Camera size={16} />
                Use camera
              </button>
              <button className="dialog-btn dialog-btn-confirm" onClick={handleManualSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

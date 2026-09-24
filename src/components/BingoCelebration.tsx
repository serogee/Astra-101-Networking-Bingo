import { useEffect, useRef } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { getItemById, FREE_SPACE_INDEX } from '../data/bingoItems';
import { getTraitIdAtIndex, type BoardState } from '../utils/storage';
import './BingoCelebration.css';

interface BingoCelebrationProps {
  open: boolean;
  playerName: string;
  board: BoardState;
  onBack: () => void;
}

export function BingoCelebration({ open, playerName, board, onBack }: BingoCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti animation
  useEffect(() => {
    if (!open) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7B8CFF', '#FF6B8A', '#FFCB6B', '#4ECDC4', '#A78BFA', '#F472B6'];
    const particles: Array<{
      x: number; y: number; w: number; h: number;
      color: string; vx: number; vy: number; rot: number; vr: number;
    }> = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.04; // gravity

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 3 + 2;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [open]);

  if (!open || !board.winningLine) return null;

  // Get contributors from the winning line
  const contributors = board.winningLine
    .filter((idx) => idx !== FREE_SPACE_INDEX && board.tiles[idx]?.provider)
    .map((idx) => {
      const tile = board.tiles[idx]!;
      const traitId = getTraitIdAtIndex(board, idx);
      const item = getItemById(traitId);
      return {
        name: tile.provider!.name,
        trait: item?.label ?? traitId,
      };
    });

  return (
    <div className="celebration-overlay">
      <canvas ref={canvasRef} className="celebration-confetti" />

      <div className="celebration-content">
        <div className="celebration-icon">
          <Star size={40} strokeWidth={1.5} />
        </div>

        <h1 className="celebration-title">🎉 BINGO!</h1>
        <p className="celebration-subtitle">Show this to a judge</p>

        <div className="celebration-player">
          <span className="celebration-player-label">Player</span>
          <span className="celebration-player-name">{playerName}</span>
        </div>

        {/* Mini board showing winning line */}
        <div className="celebration-mini-board">
          {Array.from({ length: 25 }, (_, i) => {
            const inLine = board.winningLine!.includes(i);
            const isClaimed = board.tiles[i] != null;
            const isFree = i === FREE_SPACE_INDEX;

            return (
              <div
                key={i}
                className={`celebration-mini-tile ${inLine ? 'in-line' : ''} ${isClaimed ? 'claimed' : ''} ${isFree ? 'free' : ''}`}
              />
            );
          })}
        </div>

        <div className="celebration-contributors">
          <span className="celebration-contributors-title">Contributors</span>
          {contributors.map((c, i) => (
            <div key={i} className="celebration-contributor">
              <span className="celebration-contributor-name">{c.name}</span>
              <span className="celebration-contributor-trait">{c.trait}</span>
            </div>
          ))}
        </div>

        <button className="celebration-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Board
        </button>
      </div>
    </div>
  );
}

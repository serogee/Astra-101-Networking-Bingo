import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BINGO_ITEMS } from '../data/bingoItems';
import { useGame } from '../context/GameContext';
import './SetupScreen.css';

const MIN_TRAITS = 3;
const MAX_TRAITS = 5;
const MAX_NAME_LENGTH = 40;

export function SetupScreen() {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const traitCount = selectedTraits.size;
  const canSubmit = trimmedName.length > 0 && traitCount >= MIN_TRAITS && traitCount <= MAX_TRAITS;

  const toggleTrait = (id: string) => {
    setError(null);
    setSelectedTraits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_TRAITS) {
          setError(`You can select at most ${MAX_TRAITS} traits.`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (traitCount < MIN_TRAITS) {
      setError(`Select at least ${MIN_TRAITS} traits.`);
      return;
    }
    if (traitCount > MAX_TRAITS) {
      setError(`Select at most ${MAX_TRAITS} traits.`);
      return;
    }

    dispatch({
      type: 'CREATE_PROFILE',
      name: trimmedName,
      traitIds: Array.from(selectedTraits),
    });
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="setup-brand">
          <span className="setup-brand-name">ASTRA</span>
          <span className="setup-brand-sub">101</span>
        </div>
        <h1 className="setup-title">NETWORKING BINGO</h1>
        <p className="setup-subtitle">Meet. Connect. Build.</p>
      </div>

      <div className="setup-form">
        <div className="setup-field">
          <label className="setup-label" htmlFor="player-name">Your Name</label>
          <input
            id="player-name"
            className="setup-input"
            type="text"
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NAME_LENGTH) {
                setName(e.target.value);
                setError(null);
              }
            }}
            placeholder="Enter your display name"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="setup-field">
          <div className="setup-label-row">
            <label className="setup-label">Select Your Traits</label>
            <span className={`setup-count ${traitCount >= MIN_TRAITS ? 'valid' : ''}`}>
              {traitCount}/{MAX_TRAITS} selected
            </span>
          </div>
          <p className="setup-hint">Pick {MIN_TRAITS}–{MAX_TRAITS} things that describe you</p>

          <div className="setup-trait-grid">
            {BINGO_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedTraits.has(item.id);

              return (
                <button
                  key={item.id}
                  className={`setup-trait-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTrait(item.id)}
                  aria-pressed={isSelected}
                  aria-label={item.label}
                >
                  {isSelected && (
                    <span className="setup-trait-check">
                      <CheckCircle2 size={14} />
                    </span>
                  )}
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="setup-trait-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="setup-error">{error}</p>}

        <button
          className="setup-submit"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Start Playing
        </button>
      </div>
    </div>
  );
}

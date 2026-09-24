import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { BINGO_ITEMS } from '../data/bingoItems';
import { shuffle } from '../utils/shuffle';
import { encodeQR } from '../utils/qrCodec';
import {
  loadState, saveState, clearState, createBoard, findIndexForTraitId,
  type GameState, type Profile, type ProviderSnapshot, type ClaimedTile,
  INITIAL_STATE,
} from '../utils/storage';
import { detectBingo } from '../hooks/useBingoDetection';

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'CREATE_PROFILE'; name: string; traitIds: string[] }
  | { type: 'CLAIM_TILE'; traitId: string; provider: ProviderSnapshot }
  | { type: 'REROLL_BOARD' }
  | { type: 'CLEAR_ALL' }
  | { type: 'HYDRATE'; state: GameState };

// ─── Reducer ────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'CREATE_PROFILE': {
      const id = crypto.randomUUID();
      const profile: Profile = {
        id,
        name: action.name.trim(),
        traitIds: action.traitIds,
      };
      const shuffled = shuffle(BINGO_ITEMS.map((item) => item.id));
      const board = createBoard(shuffled);

      return {
        ...state,
        profile,
        board,
        scannedProfileIds: [],
      };
    }

    case 'CLAIM_TILE': {
      if (!state.board || state.board.bingoAchieved) return state;

      const index = findIndexForTraitId(state.board, action.traitId);
      if (index === -1) return state;
      if (state.board.tiles[index] != null) return state; // already claimed

      const claimed: ClaimedTile = {
        traitId: action.traitId,
        provider: action.provider,
      };

      const newTiles = { ...state.board.tiles, [index]: claimed };
      const newScanned = [...state.scannedProfileIds, action.provider.profileId];

      const newBoard = { ...state.board, tiles: newTiles };

      // Check for bingo
      const winningLine = detectBingo(newBoard);
      if (winningLine) {
        newBoard.winningLine = winningLine;
        newBoard.bingoAchieved = true;
      }

      return {
        ...state,
        board: newBoard,
        scannedProfileIds: newScanned,
      };
    }

    case 'REROLL_BOARD': {
      const shuffled = shuffle(BINGO_ITEMS.map((item) => item.id));
      const board = createBoard(shuffled);
      return {
        ...state,
        board,
        scannedProfileIds: [],
      };
    }

    case 'CLEAR_ALL': {
      clearState();
      return { ...INITIAL_STATE };
    }

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  qrString: string | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadState());

  // Persist on every state change
  const initialRender = React.useRef(true);
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  // Compute QR string
  const qrString = state.profile
    ? encodeQR({
        v: 1,
        id: state.profile.id,
        name: state.profile.name,
        traits: state.profile.traitIds,
      })
    : null;

  return (
    <GameContext.Provider value={{ state, dispatch, qrString }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within <GameProvider>');
  return ctx;
}

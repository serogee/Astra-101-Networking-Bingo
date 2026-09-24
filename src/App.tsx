import { GameProvider, useGame } from './context/GameContext';
import { SetupScreen } from './screens/SetupScreen';
import { BoardScreen } from './screens/BoardScreen';

function AppContent() {
  const { state } = useGame();

  // Show setup if no profile exists
  if (!state.profile || !state.board) {
    return <SetupScreen />;
  }

  return <BoardScreen />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

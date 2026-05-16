interface GameStoreState {
  selectedGameId: string | null;
  currentGameId: string | null;
  queuedAt: string | null;
}

let gameState: GameStoreState = {
  selectedGameId: 'batalla-naval',
  currentGameId: null,
  queuedAt: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getGameStoreState() {
  return gameState;
}

export function subscribeToGameStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setSelectedGame(gameId: string) {
  gameState = {
    ...gameState,
    selectedGameId: gameId,
  };
  emitChange();
}

export function setCurrentGame(gameId: string, queuedAt: string) {
  gameState = {
    ...gameState,
    currentGameId: gameId,
    queuedAt,
  };
  emitChange();
}

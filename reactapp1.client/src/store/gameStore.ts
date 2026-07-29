import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore {
  selectedGameId: string | null;
  currentGameId: string | null;
  queuedAt: string | null;
  setSelectedGame: (gameId: string) => void;
  setCurrentGame: (gameId: string, queuedAt: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      selectedGameId: 'tic-tac-toe',
      currentGameId: null,
      queuedAt: null,
      setSelectedGame: (gameId) => set({ selectedGameId: gameId }),
      setCurrentGame: (gameId, queuedAt) => set({ currentGameId: gameId, queuedAt }),
    }),
    {
      name: 'playhub-game',
      partialize: (state) => ({ selectedGameId: state.selectedGameId }),
    },
  ),
);
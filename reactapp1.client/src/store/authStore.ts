import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, UserProfile } from '../types/auth.types';

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  error: string | null;
  setAuthSession: (session: AuthSession) => void;
  clearAuthState: () => void;
  setAuthInitializing: (value: boolean) => void;
  setAuthError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
      error: null,
      setAuthSession: (session) =>
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isInitializing: false,
          error: null,
        }),
      clearAuthState: () =>
        set((state) => {
          if (
            state.user === null &&
            state.token === null &&
            !state.isAuthenticated &&
            !state.isInitializing &&
            state.error === null
          ) {
            return state;
          }

          return {
            user: null,
            token: null,
            isAuthenticated: false,
            isInitializing: false,
            error: null,
          };
        }),
      setAuthInitializing: (value) => set({ isInitializing: value }),
      setAuthError: (error) => set({ error }),
    }),
    {
      name: 'playhub-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

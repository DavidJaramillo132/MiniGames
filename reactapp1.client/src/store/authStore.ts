import type { AuthSession, AuthState } from '../types/auth.types';
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  isTokenExpired,
  saveStoredSession,
} from '../utils/tokenHelper';

const storedToken = getStoredToken();
const storedUser = getStoredUser();
const hasValidStoredSession = Boolean(storedToken && storedUser && !isTokenExpired(storedToken));

if (storedToken && !hasValidStoredSession) {
  clearStoredSession();
}

let authState: AuthState = {
  user: hasValidStoredSession ? storedUser : null,
  token: hasValidStoredSession ? storedToken : null,
  isAuthenticated: hasValidStoredSession,
  isInitializing: hasValidStoredSession,
  error: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getAuthStoreState() {
  return authState;
}

export function subscribeToAuthStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function setAuthSession(session: AuthSession) {
  authState = {
    user: session.user,
    token: session.token,
    isAuthenticated: true,
    isInitializing: false,
    error: null,
  };

  saveStoredSession(session.token, session.user);
  emitChange();
}

export function clearAuthState() {
  authState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: false,
    error: null,
  };

  clearStoredSession();
  emitChange();
}

export function setAuthInitializing(isInitializing: boolean) {
  authState = {
    ...authState,
    isInitializing,
  };

  emitChange();
}

export function setAuthError(error: string | null) {
  authState = {
    ...authState,
    error,
  };

  emitChange();
}

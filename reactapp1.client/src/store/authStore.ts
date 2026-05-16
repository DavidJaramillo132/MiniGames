import type { AuthSession, AuthState } from '../types/auth.types';
import { clearStoredSession, getStoredToken, getStoredUser, saveStoredSession } from '../utils/tokenHelper';

let authState: AuthState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken() && getStoredUser()),
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
  };

  saveStoredSession(session.token, session.user);
  emitChange();
}

export function clearAuthState() {
  authState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  clearStoredSession();
  emitChange();
}

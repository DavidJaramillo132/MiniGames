import type { UserProfile } from '../types/auth.types';

const TOKEN_KEY = 'playhub.token';
const USER_KEY = 'playhub.user';

function hasWindow() {
  return typeof window !== 'undefined';
}

export function saveStoredSession(token: string, user: UserProfile) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredToken() {
  if (!hasWindow()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserProfile | null {
  if (!hasWindow()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as UserProfile;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

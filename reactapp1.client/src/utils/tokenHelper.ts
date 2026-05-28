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

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  return window.atob(padded);
}

export function getTokenExpiration(token: string): number | null {
  if (!hasWindow()) {
    return null;
  }

  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const expiresAt = getTokenExpiration(token);

  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt;
}

import { useAuthStore } from '../store/authStore';
import { useCallback } from 'react';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  getCurrentUser,
} from '../services/authService';
import type { LoginCredentials, RegistrationFields } from '../types/auth.types';

function getFriendlyAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Invalid email or password')) {
      return 'Invalid email or password.';
    }
    if (error.message.includes('already') || error.message.includes('Conflict')) {
      return 'An account with that information already exists.';
    }
  }
  return 'Authentication failed. Please try again.';
}

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isInitializing,
    error,
    setAuthSession,
    clearAuthState,
    setAuthInitializing,
    setAuthError,
  } = useAuthStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthError(null);
      const session = await loginService(credentials);
      setAuthSession(session);
      return session;
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    }
  }, [setAuthError, setAuthSession]);

  const register = useCallback(async (fields: RegistrationFields) => {
    try {
      setAuthError(null);
      const session = await registerService(fields);
      setAuthSession(session);
      return session;
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    }
  }, [setAuthError, setAuthSession]);

  const logout = useCallback(async () => {
    await logoutService();
    clearAuthState();
  }, [clearAuthState]);

  const initializeSession = useCallback(async () => {
    const storeToken = useAuthStore.getState().token;
    if (!storeToken) {
      clearAuthState();
      return;
    }
    try {
      setAuthInitializing(true);
      const userData = await getCurrentUser();
      setAuthSession({ token: storeToken, user: userData });
    } catch {
      clearAuthState();
    }
  }, [clearAuthState, setAuthInitializing, setAuthSession]);

  return {
    user,
    token,
    isAuthenticated,
    isInitializing,
    error,
    login,
    register,
    logout,
    initializeSession,
  };
}

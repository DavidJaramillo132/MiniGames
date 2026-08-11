import { useAuthStore } from '../store/authStore';
import { useCallback } from 'react';
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  getCurrentUser,
} from '../services/authService';
import type { LoginCredentials, RegistrationFields } from '../types/auth.types';
import { type TranslationKey } from '../i18n/LanguageProvider';
import { useI18n } from '../i18n/LanguageContext';

function getFriendlyAuthError(error: unknown): TranslationKey {
  if (error instanceof Error) {
    if (error.message.includes('Invalid email or password')) {
      return 'invalidCredentials';
    }
    if (error.message.includes('already') || error.message.includes('Conflict')) {
      return 'accountExists';
    }
  }
  return 'authFailed';
}

export function useAuth() {
  const { t } = useI18n();
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
      setAuthError(t(getFriendlyAuthError(error)));
      throw error;
    }
  }, [setAuthError, setAuthSession, t]);

  const register = useCallback(async (fields: RegistrationFields) => {
    try {
      setAuthError(null);
      const session = await registerService(fields);
      setAuthSession(session);
      return session;
    } catch (error) {
      setAuthError(t(getFriendlyAuthError(error)));
      throw error;
    }
  }, [setAuthError, setAuthSession, t]);

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

import { useSyncExternalStore } from 'react';
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from '../services/authService';
import {
  clearAuthState,
  getAuthStoreState,
  setAuthError,
  setAuthInitializing,
  setAuthSession,
  subscribeToAuthStore,
} from '../store/authStore';
import type { LoginCredentials, RegistrationFields } from '../types/auth.types';
import { getStoredToken, isTokenExpired } from '../utils/tokenHelper';

function getFriendlyAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Invalid email or password')) {
      return 'El correo o la contrasena no son correctos.';
    }

    if (error.message.includes('already') || error.message.includes('Conflict')) {
      return 'Ya existe una cuenta con esos datos.';
    }
  }

  return 'No pudimos completar la autenticacion. Intentalo otra vez.';
}

export function useAuth() {
  const state = useSyncExternalStore(
    subscribeToAuthStore,
    getAuthStoreState,
    getAuthStoreState,
  );

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthError(null);
      const session = await loginService(credentials);
      setAuthSession(session);
      return session;
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    }
  };

  const register = async (fields: RegistrationFields) => {
    try {
      setAuthError(null);
      const session = await registerService(fields);
      setAuthSession(session);
      return session;
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    }
  };

  const logout = async () => {
    await logoutService();
    clearAuthState();
  };

  const initializeSession = async () => {
    const token = getStoredToken();

    if (!token || isTokenExpired(token)) {
      clearAuthState();
      return;
    }

    try {
      setAuthInitializing(true);
      const user = await getCurrentUser();
      setAuthSession({ token, user });
    } catch {
      clearAuthState();
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
    initializeSession,
  };
}

import { useSyncExternalStore } from 'react';
import { login as loginService, logout as logoutService, register as registerService } from '../services/authService';
import { clearAuthState, getAuthStoreState, setAuthSession, subscribeToAuthStore } from '../store/authStore';
import type { LoginCredentials, RegistrationFields } from '../types/auth.types';

export function useAuth() {
  const state = useSyncExternalStore(
    subscribeToAuthStore,
    getAuthStoreState,
    getAuthStoreState,
  );

  const login = async (credentials: LoginCredentials) => {
    const session = await loginService(credentials);
    setAuthSession(session);
    return session;
  };

  const register = async (fields: RegistrationFields) => {
    const session = await registerService(fields);
    setAuthSession(session);
    return session;
  };

  const logout = async () => {
    await logoutService();
    clearAuthState();
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
}

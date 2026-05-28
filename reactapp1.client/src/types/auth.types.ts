export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  error: string | null;
}

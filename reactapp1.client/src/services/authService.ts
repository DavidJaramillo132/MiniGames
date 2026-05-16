import { mockRequest } from './api';
import type {
  AuthSession,
  LoginCredentials,
  RegistrationFields,
  UserProfile,
} from '../types/auth.types';

function toInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

function buildUserProfile(name: string, email: string): UserProfile {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    email,
    initials: toInitials(name || email),
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const displayName = credentials.email.split('@')[0] || 'Player';

  return mockRequest({
    token: `playhub-token-${Date.now()}`,
    user: buildUserProfile(displayName, credentials.email),
  });
}

export async function register(fields: RegistrationFields): Promise<AuthSession> {
  return mockRequest({
    token: `playhub-token-${Date.now()}`,
    user: buildUserProfile(fields.username, fields.email),
  });
}

export async function logout(): Promise<void> {
  await mockRequest(undefined);
}

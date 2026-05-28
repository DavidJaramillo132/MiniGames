import { apiFetch } from './api';
import type {
  AuthSession,
  LoginCredentials,
  RegistrationFields,
} from '../types/auth.types';

interface ApiAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
  };
}

function mapApiResponse(response: ApiAuthResponse): AuthSession {
  return {
    token: response.token,
    user: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      initials: response.user.initials,
    },
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiFetch<ApiAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return mapApiResponse(response);
}

export async function register(fields: RegistrationFields): Promise<AuthSession> {
  const response = await apiFetch<ApiAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: fields.username,
      email: fields.email,
      password: fields.password,
    }),
  });

  return mapApiResponse(response);
}

export async function getCurrentUser(): Promise<AuthSession['user']> {
  return apiFetch<AuthSession['user']>('/auth/me');
}

export async function logout(): Promise<void> {
  // JWT is stateless — just clear the local session.
  // If we add refresh tokens later, we'd call a server endpoint here.
}

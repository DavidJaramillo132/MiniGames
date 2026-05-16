export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function mockRequest<T>(payload: T, delayMs = 500): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  return payload;
}
